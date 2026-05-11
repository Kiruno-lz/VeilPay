import { useState, useCallback } from 'react';
import { useAppState } from '../context/useAppState';
import { useWallet } from '../hooks/useWallet';
import { CloakSDK } from '../lib/cloak';
import { generateClaimLink } from '../lib/claimLink';
import type { Recipient, ClaimLink } from '../types';

interface DisburseFormProps {
  className?: string;
}

function DisburseForm({ className }: DisburseFormProps) {
  const { state, dispatch } = useAppState();
  const { connected } = useWallet();
  const recipients = state.recipients;
  const disbursement = state.disbursement;

  const [errorRecipient, setErrorRecipient] = useState<Recipient | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const isDisbursing = disbursement.status === 'disbursing';
  const canDisburse = recipients.length > 0 && connected && !isDisbursing;

  const processRecipient = useCallback(
    async (
      sdk: CloakSDK,
      recipient: Recipient,
      index: number
    ): Promise<boolean> => {
      try {
        const result = await sdk.transfer({
          to: recipient.address,
          amount: recipient.amount,
        });

        const claimUrl = await generateClaimLink({
          commitment: result.txHash,
          note: recipient.address,
          amount: recipient.amount,
          recipient: recipient.address,
        });

        const claimLink: ClaimLink = {
          id: `${Date.now()}-${index}`,
          recipient: `${recipient.address.slice(0, 6)}...${recipient.address.slice(-4)}`,
          amount: recipient.amount,
          token: 'USDC',
          url: claimUrl,
          status: 'pending',
          createdAt: new Date(),
        };

        dispatch({ type: 'ADD_CLAIM_LINK', payload: claimLink });
        dispatch({ type: 'SET_DISBURSEMENT_PROGRESS', payload: index + 1 });
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Transfer failed';
        setErrorMessage(message);
        setErrorRecipient(recipient);
        dispatch({ type: 'SET_DISBURSEMENT_STATUS', payload: 'error' });
        return false;
      }
    },
    [dispatch]
  );

  const handleDisburse = useCallback(async () => {
    if (recipients.length === 0 || !connected) return;

    setErrorRecipient(null);
    setErrorMessage(null);

    dispatch({ type: 'SET_DISBURSEMENT_STATUS', payload: 'disbursing' });
    dispatch({ type: 'SET_DISBURSEMENT_PROGRESS', payload: 0 });
    dispatch({ type: 'SET_CLAIM_LINKS', payload: [] });

    // Live mode requires a signer Keypair; for now we use mock fallback
    const sdk = new CloakSDK({ network: 'devnet' });

    for (let i = 0; i < recipients.length; i++) {
      const success = await processRecipient(sdk, recipients[i], i);
      if (!success) {
        // Stop on error; user can retry or skip
        return;
      }
    }

    dispatch({ type: 'SET_DISBURSEMENT_STATUS', payload: 'completed' });
  }, [recipients, connected, dispatch, processRecipient]);

  const handleRetry = useCallback(async () => {
    if (!errorRecipient) return;

    setErrorRecipient(null);
    setErrorMessage(null);
    dispatch({ type: 'SET_DISBURSEMENT_STATUS', payload: 'disbursing' });

    // Live mode requires a signer Keypair; for now we use mock fallback
    const sdk = new CloakSDK({ network: 'devnet' });

    const currentIndex = disbursement.progress;
    const success = await processRecipient(sdk, errorRecipient, currentIndex);

    if (success) {
      // Continue with remaining recipients
      for (let i = currentIndex + 1; i < recipients.length; i++) {
        const nextSuccess = await processRecipient(sdk, recipients[i], i);
        if (!nextSuccess) {
          return;
        }
      }
      dispatch({ type: 'SET_DISBURSEMENT_STATUS', payload: 'completed' });
    }
  }, [errorRecipient, disbursement.progress, recipients, dispatch, processRecipient]);

  const handleSkip = useCallback(async () => {
    if (!errorRecipient) return;

    setErrorRecipient(null);
    setErrorMessage(null);
    dispatch({ type: 'SET_DISBURSEMENT_STATUS', payload: 'disbursing' });

    // Live mode requires a signer Keypair; for now we use mock fallback
    const sdk = new CloakSDK({ network: 'devnet' });

    const currentIndex = disbursement.progress;
    // Skip the failed recipient and continue with the next one
    for (let i = currentIndex + 1; i < recipients.length; i++) {
      const success = await processRecipient(sdk, recipients[i], i);
      if (!success) {
        return;
      }
    }

    dispatch({ type: 'SET_DISBURSEMENT_STATUS', payload: 'completed' });
  }, [errorRecipient, disbursement.progress, recipients, dispatch, processRecipient]);

  const handleCopyLink = useCallback(async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Fallback: silently ignore copy errors
    }
  }, []);

  const progressPercent =
    recipients.length > 0
      ? Math.round((disbursement.progress / recipients.length) * 100)
      : 0;

  return (
    <div
      data-testid="disburse-form"
      className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className || ''}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          3
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-4">Disburse</h3>

          {recipients.length === 0 ? (
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <p className="text-gray-400 text-center" data-testid="no-recipients">
                No recipients yet
              </p>
            </div>
          ) : (
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <p className="text-gray-300 text-sm mb-2">
                {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
              </p>
              <ul className="space-y-2" data-testid="recipient-list">
                {recipients.map((recipient, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center text-sm"
                    data-testid={`recipient-${index}`}
                  >
                    <span className="text-gray-400 font-mono">
                      {recipient.address.slice(0, 8)}...{recipient.address.slice(-8)}
                    </span>
                    <span className="text-white">
                      {recipient.amount.toFixed(2)} USDC
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isDisbursing && (
            <div className="mb-4" data-testid="progress-section">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Progress</span>
                <span className="text-white">
                  {disbursement.progress} / {recipients.length} processed
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                  data-testid="progress-bar"
                />
              </div>
            </div>
          )}

          {disbursement.status === 'completed' && (
            <div className="mb-4" data-testid="completed-section">
              <p className="text-green-400 text-sm mb-2" data-testid="completion-message">
                Disbursement completed! {disbursement.claimLinks.length} claim link{disbursement.claimLinks.length !== 1 ? 's' : ''} generated.
              </p>
              <div className="space-y-2">
                <p className="text-gray-300 text-sm font-semibold">Claim Links:</p>
                {disbursement.claimLinks.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-700 rounded-lg p-2"
                    data-testid={`claim-link-${index}`}
                  >
                    <button
                      onClick={() => handleCopyLink(link.url, index)}
                      className="flex-1 text-left text-sm text-blue-400 hover:text-blue-300 truncate font-mono"
                      title="Click to copy"
                    >
                      {link.recipient} — {(link.amount / 1_000_000).toFixed(2)} USDC
                    </button>
                    {copiedIndex === index && (
                      <span className="text-green-400 text-xs" data-testid={`copied-${index}`}>
                        Copied!
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {disbursement.status === 'error' && errorMessage && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-4" data-testid="error-section">
              <p className="text-red-400 text-sm mb-2">
                Error: {errorMessage}
              </p>
              {errorRecipient && (
                <p className="text-gray-400 text-xs mb-3">
                  Failed recipient: {errorRecipient.address.slice(0, 8)}...{errorRecipient.address.slice(-8)}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-500"
                  data-testid="retry-button"
                >
                  Retry
                </button>
                <button
                  onClick={handleSkip}
                  className="flex-1 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-500"
                  data-testid="skip-button"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {disbursement.status !== 'error' && (
            <button
              onClick={handleDisburse}
              disabled={!canDisburse}
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500"
              data-testid="disburse-button"
            >
              {isDisbursing ? 'Disbursing...' : 'Disburse'}
            </button>
          )}

          {!connected && recipients.length > 0 && disbursement.status === 'idle' && (
            <p className="text-gray-400 text-sm mt-2 text-center" data-testid="connect-wallet-message">
              Connect wallet to disburse
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DisburseForm;
