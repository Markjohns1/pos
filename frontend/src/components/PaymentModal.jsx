import React, { useState } from 'react';
import { api } from '../services/api';

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState('card'); // 'card' or 'link'
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        currency: 'USD',
        description: '',
        customer_phone: '',
        customer_email: '',
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Convert to cents
        const amountInCents = Math.round(parseFloat(formData.amount) * 100);

        try {
            let result;
            if (activeTab === 'card') {
                result = await api.createPayment({
                    ...formData,
                    amount: amountInCents,
                });
            } else {
                result = await api.createPaymentLink({
                    ...formData,
                    amount: amountInCents,
                    send_sms: true,
                });
            }

            onSuccess(result);
            onClose();
        } catch (error) {
            alert(`Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-card animate-fade-in">
                <div className="modal-header">
                    <h2>{activeTab === 'card' ? 'Terminal Charge' : 'Send Payment Link'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-tabs">
                    <button
                        className={activeTab === 'card' ? 'active' : ''}
                        onClick={() => setActiveTab('card')}
                    >
                        Terminal
                    </button>
                    <button
                        className={activeTab === 'link' ? 'active' : ''}
                        onClick={() => setActiveTab('link')}
                    >
                        SMS Link
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Amount (USD)</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            required
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. Consultation Fee"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {activeTab === 'link' && (
                        <div className="form-group">
                            <label>Customer Phone (for SMS)</label>
                            <input
                                type="tel"
                                placeholder="+254..."
                                required
                                value={formData.customer_phone}
                                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                            />
                        </div>
                    )}

                    {activeTab === 'card' && (
                        <div className="form-group">
                            <label>Customer Email (for Digital Receipt)</label>
                            <input
                                type="email"
                                placeholder="customer@example.com"
                                value={formData.customer_email}
                                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Processing...' : activeTab === 'card' ? 'Start Charge' : 'Send SMS Link'}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          width: 100%;
          max-width: 450px;
          padding: 32px;
          border-color: rgba(255, 255, 255, 0.2);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
        }
        .modal-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          background: rgba(0,0,0,0.2);
          padding: 4px;
          border-radius: 12px;
        }
        .modal-tabs button {
          flex: 1;
          padding: 8px;
          border: none;
          background: none;
          color: var(--text-muted);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: 0.2s;
        }
        .modal-tabs button.active {
          background: var(--bg-card);
          color: var(--accent-primary);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }
        .form-group label {
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .modal-footer {
          display: flex;
          gap: 12px;
          margin-top: 32px;
        }
        .btn-secondary {
          flex: 1;
          background: rgba(255,255,255,0.05);
          color: white;
          border: 1px solid var(--border-glass);
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
        }
      `}</style>
        </div>
    );
};

export default PaymentModal;
