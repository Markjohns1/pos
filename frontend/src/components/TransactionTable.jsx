import React from 'react';
import { ExternalLink, ChevronRight, Hash, DollarSign, Calendar, Zap, CreditCard as CardIcon } from 'lucide-react';

const TransactionTable = ({ transactions, onSelectTransaction }) => {
  return (
    <div className="overflow-x-auto min-w-full">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr className="bg-black/20 text-slate-500 text-[10px] font-black uppercase tracking-[3px]">
            <th className="px-8 py-5 border-b border-white/5 whitespace-nowrap">
              <div className="flex items-center gap-2 italic">
                <Hash size={10} /> Entry ID
              </div>
            </th>
            <th className="px-8 py-5 border-b border-white/5 whitespace-nowrap text-white">
              <div className="flex items-center gap-2 italic">
                <DollarSign size={10} /> Payload Value
              </div>
            </th>
            <th className="px-8 py-5 border-b border-white/5 whitespace-nowrap">
              <div className="flex items-center gap-2 italic">
                <Zap size={10} /> State
              </div>
            </th>
            <th className="px-8 py-5 border-b border-white/5 whitespace-nowrap">
              <div className="flex items-center gap-2 italic">
                <CardIcon size={10} /> Origin Path
              </div>
            </th>
            <th className="px-8 py-5 border-b border-white/5 whitespace-nowrap">
              <div className="flex items-center gap-2 italic">
                <Calendar size={10} /> Timestamp
              </div>
            </th>
            <th className="px-8 py-5 border-b border-white/5 text-right italic whitespace-nowrap">Registry Access</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {transactions.length > 0 ? (
            transactions.map(tx => (
              <tr
                key={tx.id}
                className="group hover:bg-white/[0.02] transition-colors duration-75 cursor-pointer relative"
                onClick={() => onSelectTransaction(tx)}
              >
                <td className="px-8 py-6 text-xs font-mono font-bold text-slate-500 group-hover:text-blue-500 transition-colors">
                  {tx.id.toString().padStart(6, '0')}
                </td>
                <td className="px-8 py-6 text-sm font-black text-white italic tracking-tighter">
                  {tx.amount_display}
                </td>
                <td className="px-8 py-6">
                  <span className={`badge badge-${tx.status} shadow-sm px-3 py-1.5`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{tx.payment_method}</span>
                    {tx.card_brand && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[8px] font-bold bg-white/5 px-2 py-0.5 rounded text-slate-500 uppercase">
                          {tx.card_brand}
                        </span>
                        <span className="text-[9px] font-mono text-slate-600 tracking-[2px]">
                          •••• {tx.card_last4}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6 text-[10px] font-black text-slate-500 font-mono">
                  {new Date(tx.created_at).toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 text-blue-600 group-hover:text-blue-400 transition-colors font-black text-[10px] uppercase tracking-widest">
                    View Data <ChevronRight size={12} strokeWidth={4} />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-8 py-24 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-700">
                    <Hash size={24} strokeWidth={1} />
                  </div>
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-[5px]">Null Registry State</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
