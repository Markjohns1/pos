import React from 'react';

const TransactionTable = ({ transactions, onSelectTransaction }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider">
            <th className="px-6 py-4 font-semibold border-b border-slate-800">Transaction ID</th>
            <th className="px-6 py-4 font-semibold border-b border-slate-800">Amount</th>
            <th className="px-6 py-4 font-semibold border-b border-slate-800">Status</th>
            <th className="px-6 py-4 font-semibold border-b border-slate-800">Payment Method</th>
            <th className="px-6 py-4 font-semibold border-b border-slate-800">Date</th>
            <th className="px-6 py-4 font-semibold border-b border-slate-800 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {transactions.length > 0 ? (
            transactions.map(tx => (
              <tr
                key={tx.id}
                className="group hover:bg-slate-800/40 transition-colors duration-150 cursor-pointer"
                onClick={() => onSelectTransaction(tx)}
              >
                <td className="px-6 py-4 text-sm font-mono text-slate-400 opacity-80 group-hover:opacity-100 uppercase">
                  #{tx.id}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-white">
                  {tx.amount_display}
                </td>
                <td className="px-6 py-4">
                  <span className={`badge badge-${tx.status}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-slate-200 capitalize font-medium">{tx.payment_method}</span>
                    {tx.card_brand && (
                      <span className="text-[10px] text-slate-500 uppercase tracking-tighter">
                        {tx.card_brand} •••• {tx.card_last4}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                  {new Date(tx.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-xs font-semibold text-primary hover:text-blue-400">
                    View Receipt
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center text-slate-500 text-sm italic bg-slate-900/20">
                No processed transactions found in this view.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
