import { useState, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Keypair } from '@solana/web3.js';
import { useWalletBalance } from '../hooks/useWalletBalance';
import { CloakSDK } from '../lib/cloak';

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
  const { connected, signTransaction, sendTransaction, publicKey } = useWallet();
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
      // Use test wallet Keypair if available, otherwise use browser wallet adapter
      let signer = testWallet;
      if (!signer && publicKey && signTransaction) {
        // Browser wallet adapter for real devnet transactions
        signer = { publicKey, signTransaction, sendTransaction } as any;
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
  }, [amount, validate, refresh, testWallet, publicKey, signTransaction, sendTransaction]);

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
      className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className || ''}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          2
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-4">Deposit</h3>

          {connected ? (
            <>
              <p className="text-gray-400 mb-2">
                Balance: {publicUsdc !== null ? publicUsdc.toFixed(2) : '0.00'} USDC
              </p>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={amount}
                onInput={handleAmountChange}
                disabled={isProving}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 mb-4 disabled:opacity-50"
              />

              {depositState === 'error' && errorMessage && (
                <p className="text-red-400 text-sm mb-4">{errorMessage}</p>
              )}

              {depositState === 'confirmed' && txHash && (
                <div className="text-sm mb-4 text-green-400">
                  <p>
                    Deposit confirmed!{' '}
                    <a
                      href={`https://solscan.io/devnet/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-green-300"
                    >
                      View on Solscan
                    </a>
                  </p>
                </div>
              )}

              {depositState === 'error' ? (
                <button
                  onClick={handleRetry}
                  className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-500"
                >
                  Retry
                </button>
              ) : (
                <button
                  onClick={handleDeposit}
                  disabled={isDisabled}
                  className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500"
                >
                  {isProving ? 'Depositing...' : 'Deposit'}
                </button>
              )}
            </>
          ) : (
            <p className="text-gray-400">Connect wallet to deposit</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DepositCard;
