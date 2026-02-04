"""
SMS Service

Sends SMS messages using Africa's Talking API.
"""

from typing import Optional
import africastalking

from app.config import settings
from app.utils import logger, SMSError


class SMSService:
    """
    Service for sending SMS via Africa's Talking.
    
    Supports:
    - Single message sending
    - Bulk message sending
    - Delivery status callbacks
    """
    
    def __init__(self):
        # Initialize Africa's Talking SDK
        if settings.at_api_key:
            africastalking.initialize(
                username=settings.at_username,
                api_key=settings.at_api_key,
            )
            self.sms = africastalking.SMS
            self._initialized = True
        else:
            self._initialized = False
            logger.warning("Africa's Talking not configured - SMS disabled")
    
    async def send_sms(
        self,
        phone: str,
        message: str,
        sender_id: Optional[str] = None,
    ) -> dict:
        """
        Send an SMS message.
        
        Args:
            phone: Recipient phone number (with country code)
            message: Message content (max 160 chars for single SMS)
            sender_id: Sender ID (optional, uses default if not provided)
            
        Returns:
            Dict with success status and message ID
        """
        if not self._initialized:
            logger.warning("SMS not sent - service not initialized", phone=phone)
            return {
                "success": False,
                "error": "SMS service not configured",
            }
        
        # Normalize phone number
        phone = self._normalize_phone(phone)
        
        try:
            # Send via Africa's Talking
            response = self.sms.send(
                message=message,
                recipients=[phone],
                sender_id=sender_id or settings.at_sender_id,
            )
            
            # Parse response
            if response and response.get("SMSMessageData"):
                recipients = response["SMSMessageData"].get("Recipients", [])
                
                if recipients:
                    recipient = recipients[0]
                    status = recipient.get("status", "")
                    
                    if status == "Success":
                        logger.info(
                            "SMS sent successfully",
                            phone=phone,
                            message_id=recipient.get("messageId"),
                        )
                        return {
                            "success": True,
                            "message_id": recipient.get("messageId"),
                            "cost": recipient.get("cost"),
                        }
                    else:
                        logger.warning(
                            "SMS sending failed",
                            phone=phone,
                            status=status,
                        )
                        return {
                            "success": False,
                            "error": status,
                        }
            
            logger.warning("Unexpected SMS response", response=response)
            return {
                "success": False,
                "error": "Unexpected response from SMS service",
            }
            
        except Exception as e:
            logger.error("SMS sending error", error=str(e), phone=phone)
            return {
                "success": False,
                "error": str(e),
            }
    
    def _normalize_phone(self, phone: str) -> str:
        """
        Normalize phone number format.
        
        Ensures phone number starts with +.
        """
        phone = phone.strip().replace(" ", "").replace("-", "")
        
        if not phone.startswith("+"):
            # Assume Kenyan number if no country code
            if phone.startswith("0"):
                phone = "+254" + phone[1:]
            elif phone.startswith("254"):
                phone = "+" + phone
            else:
                phone = "+" + phone
        
        return phone
    
    async def send_receipt_sms(
        self,
        phone: str,
        receipt_number: str,
        amount: str,
        business_name: str = "POS System",
    ) -> dict:
        """
        Send a receipt summary via SMS.
        
        Convenience method for sending receipts.
        """
        message = (
            f"Receipt: {receipt_number}\n"
            f"Amount: {amount}\n"
            f"Thank you for your payment!\n"
            f"- {business_name}"
        )
        
        return await self.send_sms(phone, message)
