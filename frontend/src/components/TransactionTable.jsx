import React from 'react';

const TransactionTable = ({ transactions, onSelectTransaction }) => {
    return (
        <table className="transaction-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Method</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {transactions.length > 0 ? (
                    transactions.map(tx => (
                        <tr key={tx.id} onClick={() => onSelectTransaction(tx)}>
                            <td>#{tx.id}</td>
                            <td className="amount-cell">{tx.amount_display}</td>
                            <td>
                                <span className={`badge ${tx.status}`}>
                                    {tx.status}
                                </span>
                            </td>
                            <td className="method-cell">
                                {tx.card_brand && <span className="brand-tag">{tx.card_brand}</span>}
                                {tx.payment_method}
                                {tx.card_last4 && <small>**** {tx.card_last4}</small>}
                            </td>
                            <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                            <td>
                                <button className="action-btn">View Receipt</button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6" className="empty-state">No transactions yet</td>
                    </tr>
                )}
            </tbody>

            <style jsx>{`
        .amount-cell {
          font-weight: 700;
          color: var(--text-main);
        }
        .method-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.9rem;
        }
        .brand-tag {
          font-size: 0.7rem;
          text-transform: uppercase;
          background: rgba(255,255,255,0.1);
          padding: 2px 6px;
          border-radius: 4px;
          width: fit-content;
        }
        .action-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-glass);
          color: var(--text-muted);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: 0.2s;
        }
        .action-btn:hover {
          background: var(--accent-primary);
          color: white;
          border-color: transparent;
        }
        tr {
          cursor: pointer;
          transition: background 0.2s;
        }
        tr:hover {
          background: rgba(255,255,255,0.02) !important;
        }
      `}</style>
        </table>
    );
};

export default TransactionTable;
