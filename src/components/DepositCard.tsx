import { useState, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Keypair } from '@solana/web3.js';
import { useWalletBalance } from '../hooks/useWalletBalance';
import { CloakSDK } from '../lib/cloak';
import { cn } from '../lib/utils';

/**
 * Load a test wallet Keypair for devnet testing.
 * In dev mode (VITE_USE_TEST_WALLET=true), reads the secret key from
 * localStorage or env and creates a Keypair for real devnet interactions.
 * Returns null in production or if no test wallet is configured.
 */
function loadTestWallet(): Keypair | null {
  if (import.meta.env.VITE_USE_TEST_WALLET !== 'true') {
    return null;
  }

  try {
    const secretKeyJson = localStorage.getItem('veilpay_test_wallet');
    if (secretKeyJson) {
      const secretKey = new Uint8Array(JSON.parse(secretKeyJson));
      return Keypair.fromSecretKey(secretKey);
    }

    // Fallback: check env var (base58 encoded)
    const envKey = import.meta.env.VITE_TEST_WALLET_SECRET_KEY;
    if (envKey) {
      // Simple base58 decode would go here; for now, expect array format
      console.warn('[DepositCard] VITE_TEST_WALLET_SECRET_KEY should be a JSON array in localStorage');
    }
  } catch (err) {
    console.error('[DepositCard] Failed to load test wallet:', err);
  }

  return null;
}

type DepositState = 'idle' | 'proving' | 'confirmed' | 'error';

interface DepositCardProps {
  className?: string;
}

function DepositCard({ className }: DepositCardProps) {
  const { connected, signTransaction, publicKey } = useWallet();
  const { publicUsdc, refresh } = useWalletBalance();
  const [amount, setAmount] = useState('');
  const [depositState, setDepositState] = useState<DepositState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const testWallet = useMemo(() => loadTestWallet(), []);

  const validate = useCallback(
    (value: string): string | null => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        return 'Amount must be greater than 0';
      }
      if (publicUsdc !== null && num > publicUsdc) {
        return 'Insufficient USDC balance';
      }
      return null;
    },
    [publicUsdc]
  );

  const handleDeposit = useCallback(async () => {
    setDepositState('idle');
    setErrorMessage(null);
    setTxHash(null);

    const validationError = validate(amount);
    if (validationError) {
      setErrorMessage(validationError);
      setDepositState('error');
      return;
    }

    setDepositState('proving');

    try {
      // Use test wallet for real devnet interactions, or wallet adapter for mock
      let signer = testWallet;
      if (!signer && publicKey && signTransaction) {
        // Browser wallet: pass adapter signer (will fall back to mock with warning)
        signer = { publicKey, signTransaction } as any;
      }

      const sdk = new CloakSDK({ network: 'devnet', signer: signer || undefined });
      const result = await sdk.deposit({
        amount: parseFloat(amount),
        token: 'USDC',
      });
      setTxHash(result.txHash);
      setDepositState('confirmed');
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Deposit failed';
      setErrorMessage(message);
      setDepositState('error');
    }
  }, [amount, validate, refresh, testWallet, publicKey, signTransaction]);

  const handleRetry = useCallback(() => {
    setDepositState('idle');
    setErrorMessage(null);
  }, []);

  const handleAmountChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setAmount(e.currentTarget.value);
      setDepositState('idle');
      setErrorMessage(null);
      setTxHash(null);
    },
    []
  );

  const isProving = depositState === 'proving';
  const isDisabled = isProving || !connected;

  return (
    <div
      data-testid="deposit-card"
      className={cn('rounded-lg p-6', className)}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-4">Deposit</h3>

          {connected ? (
            <>
              <p className="text-neutral-400 mb-2">
                Balance: {publicUsdc !== null ? publicUsdc.toFixed(2) : '0.00'} USDC
              </p>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={amount}
                onInput={handleAmountChange}
                disabled={isProving}
                className={cn(
                  'w-full rounded-lg px-4 py-2 mb-4 disabled:opacity-50',
                  'bg-neutral-800 border border-neutral-600 text-neutral-100 placeholder-neutral-500',
                  'focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20'
                )}
              />

              {depositState === 'error' && errorMessage && (
                <p className="text-error-500 text-sm mb-4">{errorMessage}</p>
              )}

              {depositState === 'confirmed' && txHash && (
                <p className="text-success-500 text-sm mb-4">
                  Deposit confirmed!{' '}
                  <a
                    href={`https://solscan.io/devnet/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-success-400"
                  >
                    View on Solscan
                  </a>
                </p>
              )}

              {depositState === 'error' ? (
                <button
                  onClick={handleRetry}
                  className={cn(
                    'w-full font-semibold py-2 px-4 rounded-lg',
                    'bg-primary-500 hover:bg-primary-600 text-neutral-0'
                  )}
                >
                  Retry
                </button>
              ) : (
                <button
                  onClick={handleDeposit}
                  disabled={isDisabled}
                  className={cn(
                    'w-full font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed',
                    'bg-primary-500 hover:bg-primary-600 text-neutral-0'
                  )}
                >
                  {isProving ? 'Depositing...' : 'Deposit'}
                </button>
              )}
            </>
          ) : (
            <p className="text-neutral-400">Connect wallet to deposit</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DepositCard;
