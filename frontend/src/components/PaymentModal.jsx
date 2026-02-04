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
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500/10 rounded text-blue-500">
                            <CreditCard size={18} />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-white">Payment Interface</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="p-2 flex bg-slate-950 border-b border-slate-800">
                    <button
                        onClick={() => setActiveTab('card')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-tighter transition-all ${activeTab === 'card' ? 'bg-slate-800 text-blue-500 shadow-inner' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        <Smartphone size={16} /> Dashboard Link
                    </button>
                    <button
                        onClick={() => setActiveTab('link')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-tighter transition-all ${activeTab === 'link' ? 'bg-slate-800 text-blue-500 shadow-inner' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        <Send size={16} /> SMS Remote Link
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Asset Value</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-600 text-sm">USD</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="form-input pl-14 h-12 text-lg font-black"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Memo / Description</label>
                            <input
                                type="text"
                                className="form-input h-11"
                                placeholder="Consultation / Service Entry"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {activeTab === 'link' && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Destination Phone (SMS)</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                    <input
                                        type="tel"
                                        required
                                        className="form-input pl-11 h-11"
                                        placeholder="+1 / +254..."
                                        value={formData.customer_phone}
                                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'card' && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Client Authorization Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                    <input
                                        type="email"
                                        className="form-input pl-11 h-11"
                                        placeholder="client@vault.com"
                                        value={formData.customer_email}
                                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex items-start gap-3">
                            <Info className="text-blue-500 shrink-0 mt-0.5" size={14} />
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                Terminal requests are processed via Stripe Global Network. Ensure stable connectivity during authorization flow.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-slate flex-1 h-12 uppercase text-[10px] font-bold tracking-widest border border-slate-700">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-blue flex-[1.5] h-12 uppercase text-[10px] font-bold tracking-widest">
                            {loading ? 'Transmitting Data...' : activeTab === 'card' ? 'Authorize Payload' : 'Push Remote Link'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
