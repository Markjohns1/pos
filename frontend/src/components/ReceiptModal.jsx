import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Printer, Send, Mail, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';

const ReceiptModal = ({ isOpen, onClose, transaction }) => {
  const [delivering, setDelivering] = useState(false);
  const [delivered, setDelivered] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleSendReceipt = async (method) => {
    setDelivering(true);
    try {
      await api.generateReceipt({
        transaction_id: transaction.id,
        delivery_method: method,
      });
      setDelivered(true);
      setTimeout(() => setDelivered(false), 3000);
    } catch (error) {
      alert(`Dispatch Error: ${error}`);
    } finally {
      setDelivering(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl shadow-3xl overflow-hidden animate-none">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" size={18} />
            <span className="text-[10px] font-black uppercase tracking-[2px] text-white">Record Verified</span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-8 text-center bg-gradient-to-b from-slate-900 to-[#0a0b14]">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Transaction Total</h2>
          <p className="text-4xl font-black text-white italic">{transaction.amount_display}</p>

          <div className="mt-8 py-4 px-6 bg-slate-800/40 border border-slate-800 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
              <span className="text-slate-500">Log Entry</span>
              <span className="text-slate-300">#{transaction.id}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
              <span className="text-slate-500">Timestamp</span>
              <span className="text-slate-300">{new Date(transaction.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
              <span className="text-slate-500">Method</span>
              <span className="text-slate-100 flex items-center gap-1.5 capitalize">
                <CheckCircle size={10} className="text-emerald-500" /> {transaction.payment_method}
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {delivered ? (
              <div className="py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest">
                <CheckCircle size={14} /> Dispatch Successful
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <DispatchButton
                  icon={<Printer size={16} />}
                  label="Print"
                  onClick={() => handleSendReceipt('print')}
                  disabled={delivering}
                />
                <DispatchButton
                  icon={<Send size={16} />}
                  label="SMS"
                  onClick={() => handleSendReceipt('sms')}
                  disabled={delivering}
                />
                <DispatchButton
                  icon={<Mail size={16} />}
                  label="eMail"
                  onClick={() => handleSendReceipt('email')}
                  disabled={delivering}
                />
              </div>
            )}

            {transaction.stripe_payment_intent_id && (
              <a
                href={`https://dashboard.stripe.com/payments/${transaction.stripe_payment_intent_id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 text-[9px] font-bold text-slate-500 uppercase tracking-[2px] transition-colors hover:text-blue-500"
              >
                Verify in Stripe <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function DispatchButton({ icon, label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-2 p-4 bg-slate-800 border border-slate-700 rounded-xl group hover:border-blue-500 transition-all disabled:opacity-50"
    >
      <span className="text-slate-400 group-hover:text-blue-500">{icon}</span>
      <span className="text-[10px] font-bold text-slate-500 uppercase group-hover:text-slate-200">{label}</span>
    </button>
  )
}

export default ReceiptModal;
