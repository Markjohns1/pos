import React, { useState } from 'react';
import { api } from '../services/api';
import { X, CreditCard, Send, Smartphone, Mail, Info } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState('card');
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

        const amountInCents = Math.round(parseFloat(formData.amount) * 100);

        try {
            let result;
            if (activeTab === 'card') {
                result = await api.createPayment({ ...formData, amount: amountInCents });
            } else {
                result = await api.createPaymentLink({ ...formData, amount: amountInCents, send_sms: true });
            }
            onSuccess(result);
            onClose();
        } catch (error) {
            alert(`Execution Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#0a0b14] border border-white/5 w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden">
                {/* Protocol Header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-blue-600/10 rounded-lg text-blue-500">
                            <CreditCard size={18} />
                        </div>
                        <h2 className="text-[10px] font-black uppercase tracking-[3px]">Secure Terminal</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-600 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* System Tabs */}
                <div className="flex bg-black/20 p-1">
                    <button
                        onClick={() => setActiveTab('card')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'card' ? 'bg-white/5 text-blue-500 shadow-inner' : 'text-slate-600 hover:text-slate-400'
                            }`}
                    >
                        Terminal Key
                    </button>
                    <button
                        onClick={() => setActiveTab('link')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'link' ? 'bg-white/5 text-blue-500 shadow-inner' : 'text-slate-600 hover:text-slate-400'
                            }`}
                    >
                        SMS Remote
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Payload Asset Value</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-3 border-r border-white/5">
                                    <span className="text-[10px] font-black text-slate-500">USD</span>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="form-input pl-16 h-12 text-lg font-bold"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Entry Memo</label>
                            <input
                                type="text"
                                className="form-input h-11"
                                placeholder="Service description..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {activeTab === 'link' && (
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Target Node (Phone)</label>
                                <input
                                    type="tel"
                                    required
                                    className="form-input h-11"
                                    placeholder="+254 / +1..."
                                    value={formData.customer_phone}
                                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                />
                            </div>
                        )}

                        {activeTab === 'card' && (
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Auth Proxy (Email)</label>
                                <input
                                    type="email"
                                    className="form-input h-11"
                                    placeholder="admin@vault.io"
                                    value={formData.customer_email}
                                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex items-start gap-3">
                            <Info className="text-blue-500 shrink-0 mt-0.5" size={12} />
                            <p className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase tracking-tighter">
                                Terminal authorization is processed via Stripe Global Grid. Ensure connectivity.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-slate h-11 text-[9px]">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-blue h-11 text-[9px]">
                            {loading ? 'Transmitting...' : 'Authorize'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
