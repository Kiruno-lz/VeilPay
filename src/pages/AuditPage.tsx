import { useState } from 'react';
import { Eye, Unlock, Loader2 } from 'lucide-react';
import { useAppState } from '../context/useAppState';
import { CloakSDK } from '../lib/cloak';
import TransactionTable from '../components/TransactionTable';
import { AuditExporter } from '../components/AuditExporter';

function AuditPage() {
  const { state, dispatch } = useAppState();
  const [key, setKey] = useState('');

  const decryptStatus = state.audit.decryptStatus;
  const transactions = state.audit.transactions;
  const decryptError = state.audit.decryptError;

  const handleDecrypt = async () => {
    const trimmedKey = key.trim();
    if (!trimmedKey) return;

    dispatch({ type: 'SET_DECRYPT_STATUS', payload: 'loading' });
    dispatch({ type: 'SET_DECRYPT_ERROR', payload: null });
    dispatch({ type: 'SET_AUDIT_TRANSACTIONS', payload: [] });

    try {
      const sdk = new CloakSDK({ network: 'devnet' });
      const records = await sdk.decryptHistory(trimmedKey);
      dispatch({ type: 'SET_AUDIT_TRANSACTIONS', payload: records });
      dispatch({ type: 'SET_DECRYPT_STATUS', payload: 'success' });
    } catch {
      dispatch({ type: 'SET_DECRYPT_ERROR', payload: 'Invalid or expired viewing key' });
      dispatch({ type: 'SET_DECRYPT_STATUS', payload: 'error' });
    }
  };

  const isLoading = decryptStatus === 'loading';
  const hasTransactions = transactions.length > 0;

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
          onClick={handleDecrypt}
          disabled={!key.trim() || isLoading}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 data-testid="decrypt-loading" className="w-4 h-4 animate-spin" />
              Decrypting...
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              Decrypt History
            </>
          )}
        </button>
      </div>

      {/* Transaction Table */}
      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-200">Transaction History</h2>
        </div>
        <div className="px-4 py-4">
          {decryptStatus === 'idle' && (
            <div className="text-center text-gray-500 text-sm py-8">
              {key.trim() ? (
                <span>Press &quot;Decrypt History&quot; to load transactions</span>
              ) : (
                <span>Enter viewing key to see history</span>
              )}
            </div>
          )}
          {decryptStatus === 'loading' && <TransactionTable transactions={[]} isLoading />}
          {decryptStatus === 'error' && (
            <TransactionTable transactions={[]} error={decryptError} />
          )}
          {decryptStatus === 'success' && (
            <>
              {hasTransactions && (
                <div data-testid="transaction-count" className="mb-3 text-sm text-gray-400">
                  {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
                </div>
              )}
              <TransactionTable transactions={transactions} />
            </>
          )}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <div data-testid="export-button">
          <AuditExporter transactions={transactions} disabled={!hasTransactions} />
        </div>
      </div>
    </div>
  );
}

export default AuditPage;
