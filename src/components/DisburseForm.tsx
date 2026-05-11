import { useState, useCallback } from 'react';
import { SignJWT, importJWK } from 'jose';
import { useAppState } from '../context/useAppState';
import { CloakSDK } from '../lib/cloak';
import type { Recipient } from '../types';

// Mock secret key for JWT signing (32 bytes)
const MOCK_SECRET_KEY = new Uint8Array([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
  17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
]);

type DisburseState = 'idle' | 'disbursing' | 'completed' | 'error';

interface DisburseFormProps {
  className?: string;
}

function maskAddress(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatUsdc(amount: number): string {
  return (amount / 1_000_000).toFixed(2);
}

function DisburseForm({ className }: DisburseFormProps) {
  const { state, dispatch } = useAppState();
  const { recipients } = state;
  const walletConnected = state.wallet?.connected ?? false;

  const [disburseState, setDisburseState] = useState<DisburseState>('idle');
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [claimLinks, setClaimLinks] = useState<Array<{ url: string; recipient: string; amount: number }>>([]);
  const [failedRecipients, setFailedRecipients] = useState<Recipient[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const processRecipients = useCallback(async (recipientsToProcess: Recipient[]) => {
    const sdk = new CloakSDK({ network: 'devnet' });
    const newClaimLinks: Array<{ url: string; recipient: string; amount: number }> = [];
    const newFailed: Recipient[] = [];

    // Import the mock secret key as a JWK for jose
    const jwk = await importJWK(
      { kty: 'oct', k: Buffer.from(MOCK_SECRET_KEY).toString('base64url') },
      'HS256'
    );

    for (let i = 0; i < recipientsToProcess.length; i++) {
      const recipient = recipientsToProcess[i];
      setProgress(i + 1);

      try {
        const result = await sdk.transfer({
          to: recipient.address,
          amount: recipient.amount / 1_000_000,
        });

        const maskedAddress = maskAddress(recipient.address);
        const payload = {
          recipient: maskedAddress,
          amount: recipient.amount / 1_000_000,
          token: 'USDC',
          txHash: result.txHash,
          createdAt: Date.now(),
        };

        const jwt = await new SignJWT(payload)
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .sign(jwk);

        const claimUrl = `${window.location.origin}/claim?token=${jwt}`;

        dispatch({
          type: 'ADD_CLAIM_LINK',
          payload: {
            id: `${Date.now()}-${i}`,
            recipient: maskedAddress,
            amount: recipient.amount / 1_000_000,
            token: 'USDC',
            url: claimUrl,
            status: 'pending',
            createdAt: new Date(),
          },
        });

        newClaimLinks.push({ url: claimUrl, recipient: maskedAddress, amount: recipient.amount / 1_000_000 });
      } catch {
        newFailed.push(recipient);
      }
    }

    setClaimLinks(newClaimLinks);
    setFailedRecipients(newFailed);

    if (newFailed.length > 0 && newClaimLinks.length === 0) {
      setDisburseState('error');
    } else if (newFailed.length > 0) {
      setDisburseState('error');
    } else {
      setDisburseState('completed');
    }
  }, [dispatch]);

  const handleDisburse = useCallback(async () => {
    if (recipients.length === 0) return;

    setDisburseState('disbursing');
    setProgress(0);
    setTotal(recipients.length);
    setClaimLinks([]);
    setFailedRecipients([]);

    dispatch({ type: 'SET_DISBURSEMENT_STATUS', payload: 'disbursing' });
    dispatch({ type: 'SET_DISBURSEMENT_PROGRESS', payload: 0 });

    await processRecipients(recipients);

    dispatch({ type: 'SET_DISBURSEMENT_PROGRESS', payload: recipients.length });
  }, [recipients, dispatch, processRecipients]);

  const handleRetry = useCallback(async () => {
    if (failedRecipients.length === 0) return;

    setDisburseState('disbursing');
    setProgress(0);
    setTotal(failedRecipients.length);

    const toRetry = [...failedRecipients];
    setFailedRecipients([]);

    await processRecipients(toRetry);
  }, [failedRecipients, processRecipients]);

  const handleSkip = useCallback(() => {
    if (claimLinks.length > 0) {
      setDisburseState('completed');
    } else {
      setDisburseState('idle');
    }
    setFailedRecipients([]);
  }, [claimLinks.length]);

  const handleCopyLink = useCallback(async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Fallback: silently ignore copy errors
    }
  }, []);

  const isDisbursing = disburseState === 'disbursing';
  const isDisabled = !walletConnected || recipients.length === 0 || isDisbursing;

  const progressPercent = total > 0 ? Math.round((progress / total) * 100) : 0;

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

          {/* Recipient list */}
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            {recipients.length === 0 ? (
              <p className="text-gray-400 text-center" data-testid="no-recipients">
                No recipients yet. Upload a CSV first.
              </p>
            ) : (
              <div className="space-y-2" data-testid="recipient-list">
                {recipients.map((recipient, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                    data-testid={`recipient-${index}`}
                  >
                    <span className="text-gray-300 font-mono">
                      {maskAddress(recipient.address)}
                    </span>
                    <span className="text-gray-400">
                      {formatUsdc(recipient.amount)} USDC
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress bar */}
          {isDisbursing && (
            <div className="mb-4" data-testid="progress-section">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span data-testid="progress-text">Processing {progress}/{total}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                  data-testid="progress-bar"
                />
              </div>
            </div>
          )}

          {/* Error state */}
          {disburseState === 'error' && (
            <div className="mb-4" data-testid="error-section">
              {failedRecipients.length > 0 && (
                <div className="mb-3">
                  <p className="text-red-400 text-sm mb-2">Failed transfers:</p>
                  <div className="space-y-1">
                    {failedRecipients.map((recipient, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm text-red-300"
                        data-testid={`failed-recipient-${index}`}
                      >
                        <span className="font-mono">{maskAddress(recipient.address)}</span>
                        <span>{formatUsdc(recipient.amount)} USDC</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-500"
                  data-testid="retry-button"
                >
                  Retry Failed
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

          {/* Completed state */}
          {disburseState === 'completed' && (
            <div className="mb-4" data-testid="completed-section">
              <p className="text-green-400 text-sm mb-2" data-testid="completion-message">
                All disbursements completed!
              </p>
              <p className="text-gray-400 text-sm mb-4" data-testid="completion-summary">
                {claimLinks.length} of {recipients.length} successful
              </p>
              <div className="space-y-2">
                <p className="text-gray-300 text-sm font-semibold">Claim Links:</p>
                {claimLinks.map((link, index) => (
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
                      {link.recipient} — {link.amount.toFixed(2)} USDC
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

          {/* Disburse button */}
          {disburseState !== 'completed' && disburseState !== 'error' && (
            <button
              onClick={handleDisburse}
              disabled={isDisabled}
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500"
              data-testid="disburse-button"
            >
              {isDisbursing ? 'Disbursing...' : 'Disburse'}
            </button>
          )}

          {/* Wallet not connected message */}
          {!walletConnected && recipients.length > 0 && disburseState === 'idle' && (
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
