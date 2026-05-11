import { useState, useCallback } from 'react';
import { Shield, Loader2, CheckCircle, ExternalLink, AlertCircle, RotateCcw, Wallet } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { CloakSDK } from '../lib/cloak';

export interface ClaimButtonProps {
  commitment: string;
  note: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

export function ClaimButton({ commitment, note, onSuccess, onError }: ClaimButtonProps) {
  const { connected, publicKey, connect } = useWallet();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<'idle' | 'claiming' | 'success' | 'error'>('idle');
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClaim = useCallback(async () => {
    if (!connected || !publicKey) return;

    setIsClaiming(true);
    setClaimStatus('claiming');
    setErrorMessage(null);

    try {
      const sdk = new CloakSDK({ network: 'devnet' });
      const result = await sdk.receive({
        commitment,
        note,
      });

      setTxSignature(result.txHash);
      setClaimStatus('success');
      onSuccess?.(result.txHash);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Claim failed. Please try again.');
      setErrorMessage(error.message);
      setClaimStatus('error');
      onError?.(error);
    } finally {
      setIsClaiming(false);
    }
  }, [connected, publicKey, commitment, note, onSuccess, onError]);

  const handleConnect = useCallback(async () => {
    try {
      await connect();
    } catch {
      // Wallet connection errors are handled by the adapter UI
    }
  }, [connect]);

  // ── Success State ────────────────────────────────────────────────────────
  if (claimStatus === 'success') {
    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-green-500/20" data-testid="claim-success">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-green-400" />
          </div>
        </div>
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-white mb-1">Claim Successful!</h2>
          <p className="text-gray-400 text-sm">Check your wallet.</p>
        </div>

        {txSignature && (
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Transaction</span>
              <a
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                data-testid="tx-signature-link"
              >
                View on Explorer
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="font-mono text-xs text-gray-300 break-all" data-testid="tx-signature">
              {txSignature}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Error State with Retry ───────────────────────────────────────────────
  if (claimStatus === 'error') {
    return (
      <div className="mb-6">
        <button
          onClick={handleClaim}
          className="w-full py-4 px-6 font-bold rounded-lg transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
          data-testid="claim-button"
        >
          <Shield className="w-5 h-5" />
          Claim USDC
        </button>

        <div className="mt-3 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-red-400" data-testid="claim-error">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm" data-testid="claim-error-message">{errorMessage || 'Claim failed. Please try again.'}</span>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-red-400 mb-2">Claim Failed</h3>
          </div>
          <button
            onClick={handleClaim}
            className="inline-flex items-center gap-2 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
            data-testid="retry-claim-button"
          >
            <RotateCcw className="w-4 h-4" />
            Retry Claim
          </button>
        </div>
      </div>
    );
  }

  // ── Not Connected State ──────────────────────────────────────────────────
  if (!connected) {
    return (
      <div className="mb-6">
        <button
          onClick={handleConnect}
          className="w-full py-4 px-6 font-bold rounded-lg transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
          data-testid="connect-wallet-button"
        >
          <Wallet className="w-5 h-5" />
          Connect Wallet to Claim
        </button>
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-500" data-testid="claim-status">
            Connect your wallet to claim your USDC
          </p>
        </div>
      </div>
    );
  }

  // ── Main Claim Button ────────────────────────────────────────────────────
  const isDisabled = isClaiming;
  const buttonText = isClaiming ? 'Claiming...' : 'Claim USDC';

  return (
    <div className="mb-6">
      <button
        onClick={handleClaim}
        disabled={isDisabled}
        className={`w-full py-4 px-6 font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
          isDisabled
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
        }`}
        data-testid="claim-button"
      >
        {isClaiming ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {buttonText}
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            {buttonText}
          </>
        )}
      </button>

      {/* Status message */}
      <div className="mt-3 text-center">
        {claimStatus === 'claiming' && (
          <p className="text-sm text-indigo-400" data-testid="claim-status">
            Processing your claim...
          </p>
        )}
      </div>
    </div>
  );
}

export default ClaimButton;
