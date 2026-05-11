import { Eye, AlertCircle, Inbox } from 'lucide-react';
import type { TransactionRecord } from '../types';

interface TransactionTableProps {
  transactions: TransactionRecord[];
  isLoading?: boolean;
  error?: string | null;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatAmount(amount: number): string {
  const usdcAmount = amount / 1e6;
  return `${usdcAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USDC`;
}

function truncateTxHash(hash: string): string {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

function getExplorerUrl(txHash: string): string {
  return `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;
}

function getTypeBadgeStyles(type: TransactionRecord['type']) {
  switch (type) {
    case 'deposit':
      return 'bg-blue-900 text-blue-200';
    case 'transfer':
      return 'bg-purple-900 text-purple-200';
    case 'receive':
      return 'bg-green-900 text-green-200';
    default:
      return 'bg-gray-700 text-gray-300';
  }
}

function capitalizeType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function TransactionTable({ transactions, isLoading = false, error = null }: TransactionTableProps) {
  if (error) {
    return (
      <div
        data-testid="transaction-error-state"
        className="bg-gray-800 border border-red-700 rounded-lg p-6"
      >
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        data-testid="transaction-loading-state"
        className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-4 py-3">
                  Date
                </th>
                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-4 py-3">
                  Amount (USDC)
                </th>
                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-4 py-3">
                  Recipient
                </th>
                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-4 py-3">
                  Type
                </th>
                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-4 py-3">
                  Tx Hash
                </th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2].map((i) => (
                <tr key={i} className="border-b border-gray-700 last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-32" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 bg-gray-700 rounded animate-pulse w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-28" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div
        data-testid="transaction-empty-state"
        className="bg-gray-800 border border-gray-700 rounded-lg p-8"
      >
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Inbox className="w-8 h-8" />
          <p className="text-sm">No transactions found for this key</p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="transaction-table"
      className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-4 py-3">
                Date
              </th>
              <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-4 py-3">
                Amount (USDC)
              </th>
              <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-4 py-3">
                Recipient
              </th>
              <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-4 py-3">
                Type
              </th>
              <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-4 py-3">
                Tx Hash
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr
                key={`${tx.txHash}-${index}`}
                data-testid={`transaction-row-${index}`}
                className="border-b border-gray-700 last:border-b-0 hover:bg-gray-750 transition-colors"
              >
                <td
                  data-testid={`transaction-date-${index}`}
                  className="px-4 py-3 text-gray-200 text-sm whitespace-nowrap"
                >
                  {formatDate(tx.date)}
                </td>
                <td
                  data-testid={`transaction-amount-${index}`}
                  className="px-4 py-3 text-gray-200 text-sm whitespace-nowrap"
                >
                  {formatAmount(tx.amount)}
                </td>
                <td
                  data-testid={`transaction-recipient-${index}`}
                  className="px-4 py-3 text-gray-200 text-sm font-mono whitespace-nowrap"
                >
                  {tx.recipient || 'Unknown'}
                </td>
                <td
                  data-testid={`transaction-type-${index}`}
                  className="px-4 py-3 whitespace-nowrap"
                >
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeBadgeStyles(tx.type)}`}
                  >
                    {capitalizeType(tx.type)}
                  </span>
                </td>
                <td
                  data-testid={`transaction-txhash-${index}`}
                  className="px-4 py-3 text-sm whitespace-nowrap"
                >
                  <a
                    href={getExplorerUrl(tx.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors font-mono"
                  >
                    {truncateTxHash(tx.txHash)}
                    <Eye className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionTable;
export type { TransactionTableProps };
