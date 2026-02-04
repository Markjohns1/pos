import React, { useState } from 'react';
import { api } from '../services/api';

const ReceiptModal = ({ isOpen, onClose, transaction }) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleSendReceipt = async (method) => {
    setLoading(true);
    try {
      await api.generateReceipt({
        transaction_id: transaction.id,
        delivery_method: method,
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        onClose();
      }, 2000);
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card animate-fade-in receipt-view">
        <div className="receipt-header">
          <div className="receipt-logo">POS</div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="receipt-body">
          <h2>Payment Successful</h2>
          <p className="receipt-amount">{transaction.amount_display}</p>

          <div className="receipt-details">
            <div className="detail-row">
              <span>Date</span>
              <span>{new Date(transaction.created_at).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span>Transaction ID</span>
              <span>#{transaction.id}</span>
            </div>
            <div className="detail-row">
              <span>Method</span>
              <span>{transaction.card_brand} •••• {transaction.card_last4}</span>
            </div>
          </div>
        </div>

        <div className="receipt-actions">
          {sent ? (
            <div className="sent-confirmation animate-fade-in">
              Receipt Sent Successfully!
            </div>
          ) : (
            <>
              <h3>Send Receipt</h3>
              <div className="action-grid">
                <button onClick={() => handleSendReceipt('sms')} disabled={loading}>
                  SMS
                </button>
                <button onClick={() => handleSendReceipt('email')} disabled={loading}>
                  Email
                </button>
                <button onClick={() => window.print()} disabled={loading}>
                  Print
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .receipt-view {
          max-width: 400px;
          text-align: center;
          padding: 40px;
        }
        .receipt-logo {
          font-weight: 800;
          font-size: 1.2rem;
          color: var(--accent-primary);
        }

        .receipt-amount {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 12px 0 32px;
        }
        .receipt-details {
          background: rgba(0,0,0,0.2);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 40px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          margin-bottom: 12px;
          color: var(--text-muted);
        }
        .detail-row span:last-child {
          color: white;
          font-weight: 500;
        }
        .action-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 16px;
        }
        .action-grid button {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-glass);
          color: white;
          padding: 16px 8px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.8rem;
          transition: 0.2s;
        }
        .action-grid button:hover {
          background: rgba(255,255,255,0.1);
        }
        .sent-confirmation {
          padding: 20px;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border-radius: 12px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default ReceiptModal;
