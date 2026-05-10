import { useState } from 'react';
import { Eye, Download, Unlock } from 'lucide-react';

function AuditPage() {
  const [key, setKey] = useState('');

  return (
    <div data-testid="audit-page" className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Audit</h1>
        <p className="text-gray-400 text-sm">
          Decrypt and review transaction history using a viewing key.
        </p>
      </div>

      {/* Key Input Section */}
      <div className="space-y-3">
        <label htmlFor="key-input" className="block text-sm font-medium text-gray-300">
          Viewing Key
        </label>
        <textarea
          id="key-input"
          data-testid="key-input"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Paste your viewing key here..."
          rows={4}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <button
          data-testid="decrypt-button"
          disabled={!key.trim()}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          <Unlock className="w-4 h-4" />
          Decrypt History
        </button>
      </div>

      {/* Transaction Table Placeholder */}
      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-200">Transaction History</h2>
        </div>
        <div
          data-testid="transaction-table-placeholder"
          className="px-4 py-12 text-center text-gray-500 text-sm"
        >
          {key.trim() ? (
            <span>Press "Decrypt History" to load transactions</span>
          ) : (
            <span>Enter viewing key to see history</span>
          )}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          data-testid="export-button"
          disabled={!key.trim()}
          className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed border border-gray-700 text-gray-200 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Audit Data
        </button>
      </div>
    </div>
  );
}

export default AuditPage;
