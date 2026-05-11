import { useEffect, useRef, useCallback, useState } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { useAppState } from '../context/useAppState';

// USDC mint on Solana devnet
const DEFAULT_USDC_MINT = '61ro7AExqfk4dZYoCyRzTahahCC2TdUUZ4M5epMPunJf';

// Default refresh interval: 5 seconds
const DEFAULT_REFRESH_INTERVAL_MS = 5000;

// Default Solana RPC endpoint (devnet)
const DEFAULT_RPC_ENDPOINT = 'https://api.devnet.solana.com';

export interface UseWalletBalanceOptions {
  /** Solana connection instance (for dependency injection / testing) */
  connection?: Connection;
  /** USDC mint address */
  usdcMint?: string;
  /** Balance refresh interval in milliseconds */
  refreshInterval?: number;
}

export interface UseWalletBalanceReturn {
  /** Public wallet USDC balance (human-readable, 6 decimals) */
  publicUsdc: number | null;
  /** Shielded Cloak USDC balance (human-readable, 6 decimals) */
  shieldedUsdc: number | null;
  /** Whether a balance fetch is currently in progress */
  isLoading: boolean;
  /** Error from the last fetch attempt */
  error: string | null;
  /** Manually trigger a balance refresh */
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and monitor USDC balances (public + shielded).
 *
 * - Public balance: reads the wallet's USDC ATA via @solana/spl-token.
 * - Shielded balance: currently returns a mock value (Cloak SDK doesn't expose
 *   a direct "get balance" API yet). Designed for a one-line swap when available.
 * - Dispatches SET_BALANCE to global AppState on every successful fetch.
 * - Auto-refreshes on a timer when the wallet is connected.
 * - Cleans up the timer on unmount.
 */
export function useWalletBalance(options: UseWalletBalanceOptions = {}): UseWalletBalanceReturn {
  const {
    connection: injectedConnection,
    usdcMint = DEFAULT_USDC_MINT,
    refreshInterval = DEFAULT_REFRESH_INTERVAL_MS,
  } = options;

  const { publicKey, connected } = useSolanaWallet();
  const { dispatch } = useAppState();

  // Create a stable Connection instance (use ref to avoid re-creating on every render)
  const connectionRef = useRef<Connection | null>(injectedConnection ?? null);
  if (!connectionRef.current && !injectedConnection) {
    connectionRef.current = new Connection(DEFAULT_RPC_ENDPOINT, 'confirmed');
  }
  const connection = connectionRef.current!;

  // Track loading / error state locally (use state for reactivity)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep latest values in refs so the interval callback always sees fresh data
  const publicKeyRef = useRef(publicKey);
  const connectedRef = useRef(connected);
  const dispatchRef = useRef(dispatch);
  const isLoadingRef = useRef(false);
  const errorRef = useRef<string | null>(null);

  useEffect(() => {
    publicKeyRef.current = publicKey;
    connectedRef.current = connected;
    dispatchRef.current = dispatch;
  });

  /**
   * Fetch the public USDC balance for the connected wallet.
   * Returns null if the ATA doesn't exist (i.e. user has never held USDC).
   */
  const fetchPublicUsdc = useCallback(async (owner: PublicKey): Promise<number | null> => {
    try {
      const mintPubkey = new PublicKey(usdcMint);
      const ata = await getAssociatedTokenAddress(mintPubkey, owner);
      const accountInfo = await getAccount(connection, ata);
      // USDC has 6 decimals
      return Number(accountInfo.amount) / 1_000_000;
    } catch (err) {
      // ATA not found → balance is effectively 0
      if (err instanceof Error && err.name === 'TokenAccountNotFoundError') {
        return 0;
      }
      throw err;
    }
  }, [connection, usdcMint]);

  /**
   * Fetch the shielded USDC balance.
   * TODO: Replace with real Cloak SDK call when available.
   */
  const fetchShieldedUsdc = useCallback(async (): Promise<number | null> => {
    // Placeholder: return a fixed mock value.
    // When the Cloak SDK adds a getBalance() API, swap this line:
    // return await cloakSDK.getBalance({ token: 'USDC' });
    return 0;
  }, []);

  /**
   * Main balance refresh routine.
   */
  const refresh = useCallback(async () => {
    const currentPublicKey = publicKeyRef.current;
    const currentConnected = connectedRef.current;
    const currentDispatch = dispatchRef.current;

    if (!currentConnected || !currentPublicKey) {
      // No wallet connected → reset balances in global state
      currentDispatch({
        type: 'SET_BALANCE',
        payload: { publicUsdc: 0, shieldedUsdc: 0 },
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    isLoadingRef.current = true;
    errorRef.current = null;

    try {
      const [publicUsdc, shieldedUsdc] = await Promise.all([
        fetchPublicUsdc(currentPublicKey),
        fetchShieldedUsdc(),
      ]);

      const newBalance = {
        publicUsdc: publicUsdc ?? 0,
        shieldedUsdc: shieldedUsdc ?? 0,
      };

      currentDispatch({
        type: 'SET_BALANCE',
        payload: newBalance,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch balance';
      setError(message);
      errorRef.current = message;
      console.error('[useWalletBalance] fetch error:', message);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [fetchPublicUsdc, fetchShieldedUsdc]);

  // Initial fetch + auto-refresh interval
  useEffect(() => {
    // Run immediately when wallet state changes
    refresh();

    if (!connected || !publicKey) {
      return;
    }

    const intervalId = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [connected, publicKey, refreshInterval, refresh]);

  // Read balance from global AppState so UI always sees latest dispatched value
  const { state } = useAppState();

  return {
    publicUsdc: connected ? state.balance.publicUsdc : null,
    shieldedUsdc: connected ? state.balance.shieldedUsdc : null,
    isLoading,
    error,
    refresh,
  };
}
