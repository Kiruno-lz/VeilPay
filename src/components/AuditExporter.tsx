import { Download } from 'lucide-react';
import type { TransactionRecord } from '../types';

export interface AuditExporterProps {
  transactions: TransactionRecord[];
  disabled?: boolean;
}

function formatDate(date: Date): string {
  return date.toISOString();
}

function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

function generateFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `veilpay-audit-${year}-${month}-${day}.csv`;
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function generateCSV(transactions: TransactionRecord[]): string {
  const headers = ['Date', 'Amount (USDC)', 'Recipient', 'Type', 'Tx Hash'];
  const lines: string[] = [headers.join(',')];

  for (const tx of transactions) {
    const row = [
      escapeCSV(formatDate(tx.date)),
      escapeCSV(formatAmount(tx.amount)),
      escapeCSV(tx.recipient),
      escapeCSV(tx.type),
      escapeCSV(tx.txHash),
    ];
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

export function AuditExporter({ transactions, disabled = false }: AuditExporterProps) {
  const isDisabled = disabled || transactions.length === 0;

  const handleExport = () => {
    if (isDisabled) return;

    const csv = generateCSV(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = generateFilename();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <button
      data-testid="audit-exporter-button"
      onClick={handleExport}
      disabled={isDisabled}
      className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed border border-gray-700 text-gray-200 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
    >
      <Download className="w-4 h-4" />
      Export Audit Data
    </button>
  );
}
