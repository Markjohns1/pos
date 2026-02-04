import React from 'react';

const TransactionTable = ({ transactions, onSelectTransaction }) => {
  return (
    <div className="overflow-x-auto min-w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/[0.02] text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <th className="px-6 py-3 border-b border-white/5 whitespace-nowrap">Entry ID</th>
            <th className="px-6 py-3 border-b border-white/5 whitespace-nowrap">Value</th>
            <th className="px-6 py-3 border-b border-white/5 whitespace-nowrap">State</th>
            <th className="px-6 py-3 border-b border-white/5 whitespace-nowrap">Path</th>
            <th className="px-6 py-3 border-b border-white/5 whitespace-nowrap">Timestamp</th>
            <th className="px-6 py-3 border-b border-white/5 text-right">Access</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-slate-300">
          {transactions.length > 0 ? (
            transactions.map(tx => (
              <tr
                key={tx.id}
                className="group hover:bg-white/[0.03] transition-colors cursor-pointer"
                onClick={() => onSelectTransaction(tx)}
              >
                <td className="px-6 py-4 text-xs font-mono text-slate-600 group-hover:text-blue-500">
                  {tx.id.toString().padStart(5, '0')}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-white whitespace-nowrap">
                  {tx.amount_display}
                </td>
                <td className="px-6 py-4">
                  <span className={`badge badge-${tx.status}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-tight text-slate-400">
                  {tx.payment_method}
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-500 font-mono">
                  {new Date(tx.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-white">
                    Open
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-16 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[4px]">
                Empty Database Record
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
