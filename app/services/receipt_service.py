"""
Receipt Service

Generates and delivers receipts for transactions.
"""

from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.receipt import Receipt
from app.models.transaction import Transaction
from app.schemas.receipt import ReceiptRequest
from app.services.sms_service import SMSService
from app.utils import logger, NotFoundError


class ReceiptService:
    """
    Service for generating and delivering receipts.
    
    Supports:
    - SMS receipt summaries
    - PDF generation for printing
    - Email receipts (future)
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.sms_service = SMSService()
    
    async def generate_receipt(self, receipt_data: ReceiptRequest) -> dict:
        """
        Generate and deliver a receipt.
        
        Args:
            receipt_data: Receipt request with transaction ID and delivery method
            
        Returns:
            Receipt response
        """
        # Get the transaction
        transaction = self.db.query(Transaction).filter(
            Transaction.id == receipt_data.transaction_id
        ).first()
        
        if not transaction:
            raise NotFoundError(
                message="Transaction not found",
                code="TRANSACTION_NOT_FOUND",
            )
        
        # Generate receipt number
        receipt_number = Receipt.generate_receipt_number()
        
        # Determine recipient
        recipient = receipt_data.recipient
        if not recipient:
            if receipt_data.delivery_method == "sms":
                recipient = transaction.customer_phone
            elif receipt_data.delivery_method == "email":
                recipient = transaction.customer_email
        
        # Create receipt record
        receipt = Receipt(
            receipt_number=receipt_number,
            transaction_id=transaction.id,
            delivery_method=receipt_data.delivery_method,
            recipient=recipient,
        )
        
        self.db.add(receipt)
        self.db.commit()
        self.db.refresh(receipt)
        
        # Deliver receipt based on method
        delivered = False
        
        if receipt_data.delivery_method == "sms" and recipient:
            delivered = await self._deliver_sms_receipt(receipt, transaction)
        elif receipt_data.delivery_method == "print":
            # Generate PDF for printing
            pdf_path = await self._generate_pdf_receipt(receipt, transaction)
            receipt.pdf_path = pdf_path
            delivered = True
            self.db.commit()
        elif receipt_data.delivery_method == "email":
            # Email delivery (placeholder for now)
            logger.info("Email receipts not yet implemented")
            delivered = False
        
        return {
            "status": "success",
            "receipt_id": receipt.id,
            "receipt_number": receipt_number,
            "transaction_id": transaction.id,
            "delivery_method": receipt_data.delivery_method,
            "delivered": delivered,
            "recipient": recipient,
            "pdf_url": receipt.pdf_path,
        }
    
    async def _deliver_sms_receipt(
        self,
        receipt: Receipt,
        transaction: Transaction,
    ) -> bool:
        """Send receipt via SMS."""
        if not receipt.recipient:
            logger.warning("No phone number for SMS receipt")
            return False
        
        result = await self.sms_service.send_receipt_sms(
            phone=receipt.recipient,
            receipt_number=receipt.receipt_number,
            amount=transaction.amount_display,
        )
        
        if result["success"]:
            receipt.delivered = True
            receipt.delivered_at = datetime.utcnow()
            self.db.commit()
            return True
        else:
            receipt.delivery_error = result.get("error")
            self.db.commit()
            return False
    
    async def _generate_pdf_receipt(
        self,
        receipt: Receipt,
        transaction: Transaction,
    ) -> str:
        """
        Generate a professional PDF receipt using ReportLab.
        
        Returns relative path to the generated PDF.
        """
        import os
        from reportlab.lib.pagesizes import A6
        from reportlab.lib import colors
        from reportlab.lib.units import mm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        
        # Ensure receipts directory exists
        os.makedirs("receipts", exist_ok=True)
        
        filename = f"receipt_{receipt.receipt_number}.pdf"
        filepath = os.path.join("receipts", filename)
        
        # Create PDF document (A6 is common for thermal-style receipts)
        doc = SimpleDocTemplate(
            filepath,
            pagesize=A6,
            rightMargin=10*mm,
            leftMargin=10*mm,
            topMargin=10*mm,
            bottomMargin=10*mm
        )
        
        styles = getSampleStyleSheet()
        elements = []
        
        # Custom Styles
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=16,
            alignment=1, # Center
            spaceAfter=12
        )
        
        body_style = ParagraphStyle(
            'BodyStyle',
            parent=styles['Normal'],
            fontSize=9,
            alignment=1,
            spaceAfter=6
        )
        
        # Header - Business Info
        elements.append(Paragraph("<b>POS SYSTEM</b>", title_style))
        elements.append(Paragraph("123 Business Street, Tech City", body_style))
        elements.append(Paragraph("Tel: +254 700 000 000", body_style))
        elements.append(Spacer(1, 5*mm))
        
        # Receipt Details
        elements.append(Paragraph(f"Receipt: {receipt.receipt_number}", styles['Normal']))
        elements.append(Paragraph(f"Date: {transaction.created_at.strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
        elements.append(Spacer(1, 5*mm))
        
        # Line Items (Summary for POS)
        data = [
            ['Description', 'Amount'],
            [transaction.description or 'Payment', transaction.amount_display],
            ['', ''],
            ['<b>TOTAL</b>', f"<b>{transaction.amount_display}</b>"]
        ]
        
        t = Table(data, colWidths=[55*mm, 20*mm])
        t.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, 0), 1, colors.black),
            ('LINEABOVE', (0, -1), (-1, -1), 1, colors.black),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 10*mm))
        
        # Payment Info
        pay_info = f"Paid via {transaction.card_brand.capitalize() if transaction.card_brand else 'Card'} ****{transaction.card_last4}" if transaction.card_last4 else "Paid via Card"
        elements.append(Paragraph(pay_info, styles['Normal']))
        elements.append(Spacer(1, 10*mm))
        
        # Footer
        elements.append(Paragraph("<b>Thank you for your business!</b>", body_style))
        
        # Build PDF
        doc.build(elements)
        
        logger.info(
            "PDF receipt generated",
            receipt_number=receipt.receipt_number,
            path=filepath
        )
        
        return filepath
    
    def get_receipt(self, receipt_id: int) -> Optional[Receipt]:
        """Get a receipt by ID."""
        return self.db.query(Receipt).filter(
            Receipt.id == receipt_id
        ).first()
    
    def get_receipts_for_transaction(self, transaction_id: int) -> List[Receipt]:
        """Get all receipts for a transaction."""
        return self.db.query(Receipt).filter(
            Receipt.transaction_id == transaction_id
        ).all()
