import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { useWalletBalance } from './useWalletBalance';
import { AppStateProvider } from '../context/AppState';

// ── Mocks ────────────────────────────────────────────────────────────────

const MOCK_PUBLIC_KEY = 'MockPublicKey123';
const MOCK_USDC_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

// Mock @solana/wallet-adapter-react
let mockWalletState = {
  connected: false,
  publicKey: null as { toBase58: () => string } | null,
};

mock.module('@solana/wallet-adapter-react', () => ({
  useWallet: () => mockWalletState,
}));

// Mock @solana/web3.js
const mockGetAccount = mock(() => Promise.resolve({ amount: 1500000n }));
const mockGetAssociatedTokenAddress = mock(() =>
  Promise.resolve({ toBase58: () => 'mockAtaAddress' })
);

mock.module('@solana/web3.js', () => ({
  Connection: class MockConnection {
    rpcEndpoint = 'https://api.devnet.solana.com';
  },
  PublicKey: class MockPublicKey {
    constructor(public key: string) {}
    toBase58() {
      return this.key;
    }
    equals() {
      return false;
    }
  },
}));

// Mock @solana/spl-token
mock.module('@solana/spl-token', () => ({
  getAssociatedTokenAddress: (...args: unknown[]) => mockGetAssociatedTokenAddress(...args),
  getAccount: (...args: unknown[]) => mockGetAccount(...args),
}));

// Wrapper that provides AppState context
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppStateProvider>{children}</AppStateProvider>
);

// Helper to advance timers quickly in tests
function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 10));
}

describe('useWalletBalance', () => {
  beforeEach(() => {
    mockWalletState = {
      connected: false,
      publicKey: null,
    };
    mockGetAccount.mockClear();
    mockGetAssociatedTokenAddress.mockClear();
  });

  it('returns null balances when wallet is not connected', () => {
    const { result } = renderHook(() => useWalletBalance(), { wrapper });

    expect(result.current.publicUsdc).toBeNull();
    expect(result.current.shieldedUsdc).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches and displays public USDC balance when wallet is connected', async () => {
    mockWalletState = {
      connected: true,
      publicKey: { toBase58: () => MOCK_PUBLIC_KEY },
    };

    const { result } = renderHook(() => useWalletBalance(), { wrapper });

    // Wait for the async fetch to complete
    await act(async () => {
      await flushPromises();
    });

    expect(result.current.publicUsdc).toBe(1.5); // 1500000 / 1_000_000
    expect(result.current.shieldedUsdc).toBe(0); // mock fallback
    expect(result.current.error).toBeNull();
  });

  it('dispatches SET_BALANCE to global AppState after fetch', async () => {
    mockWalletState = {
      connected: true,
      publicKey: { toBase58: () => MOCK_PUBLIC_KEY },
    };

    // Use a single wrapper so both hooks share the same AppState context
    const { result: stateResult } = renderHook(
      () => {
        useWalletBalance();
        const { state } = require('../context/useAppState').useAppState();
        return state.balance;
      },
      { wrapper }
    );

    await act(async () => {
      await flushPromises();
    });

    expect(stateResult.current.publicUsdc).toBe(1.5);
    expect(stateResult.current.shieldedUsdc).toBe(0);
  });

  it('handles ATA not found (TokenAccountNotFoundError) as 0 balance', async () => {
    mockWalletState = {
      connected: true,
      publicKey: { toBase58: () => MOCK_PUBLIC_KEY },
    };

    const notFoundError = new Error('Token account not found');
    (notFoundError as Error & { name: string }).name = 'TokenAccountNotFoundError';
    mockGetAccount.mockImplementationOnce(() => Promise.reject(notFoundError));

    const { result } = renderHook(() => useWalletBalance(), { wrapper });

    await act(async () => {
      await flushPromises();
    });

    expect(result.current.publicUsdc).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('sets error state on unexpected fetch failure', async () => {
    mockWalletState = {
      connected: true,
      publicKey: { toBase58: () => MOCK_PUBLIC_KEY },
    };

    mockGetAccount.mockImplementationOnce(() => Promise.reject(new Error('RPC down')));

    const { result } = renderHook(() => useWalletBalance(), { wrapper });

    await act(async () => {
      await flushPromises();
    });

    // Error state should be set reactively
    expect(result.current.error).toBe('RPC down');
  });

  it('auto-refreshes balance on interval when connected', async () => {
    mockWalletState = {
      connected: true,
      publicKey: { toBase58: () => MOCK_PUBLIC_KEY },
    };

    // Use a short interval for testing
    const { result } = renderHook(
      () => useWalletBalance({ refreshInterval: 100 }),
      { wrapper }
    );

    await act(async () => {
      await flushPromises();
    });

    expect(mockGetAccount).toHaveBeenCalledTimes(1);
    expect(result.current.publicUsdc).toBe(1.5);

    // Simulate a balance change
    mockGetAccount.mockImplementation(() => Promise.resolve({ amount: 2000000n }));

    // Wait for the interval to fire
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    expect(mockGetAccount).toHaveBeenCalledTimes(2);
  });

  it('cleans up interval on unmount', async () => {
    mockWalletState = {
      connected: true,
      publicKey: { toBase58: () => MOCK_PUBLIC_KEY },
    };

    const { unmount } = renderHook(
      () => useWalletBalance({ refreshInterval: 100 }),
      { wrapper }
    );

    await act(async () => {
      await flushPromises();
    });

    const callCountAfterMount = mockGetAccount.mock.calls.length;

    unmount();

    // Wait longer than the interval
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    });

    // Should not have made additional calls after unmount
    expect(mockGetAccount.mock.calls.length).toBe(callCountAfterMount);
  });

  it('manual refresh triggers a new fetch', async () => {
    mockWalletState = {
      connected: true,
      publicKey: { toBase58: () => MOCK_PUBLIC_KEY },
    };

    const { result } = renderHook(() => useWalletBalance(), { wrapper });

    await act(async () => {
      await flushPromises();
    });

    const callCountBefore = mockGetAccount.mock.calls.length;

    // Simulate balance change
    mockGetAccount.mockImplementation(() => Promise.resolve({ amount: 3000000n }));

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockGetAccount.mock.calls.length).toBe(callCountBefore + 1);
  });

  it('resets balances to 0 in global state when wallet disconnects', async () => {
    // Start connected
    mockWalletState = {
      connected: true,
      publicKey: { toBase58: () => MOCK_PUBLIC_KEY },
    };

    // Reset mock to known value
    mockGetAccount.mockImplementation(() => Promise.resolve({ amount: 1500000n }));

    const { result: stateResult, rerender } = renderHook(
      () => {
        useWalletBalance();
        const { state } = require('../context/useAppState').useAppState();
        return state.balance;
      },
      { wrapper }
    );

    await act(async () => {
      await flushPromises();
    });

    expect(stateResult.current.publicUsdc).toBe(1.5);

    // Disconnect
    mockWalletState = {
      connected: false,
      publicKey: null,
    };

    rerender();

    await act(async () => {
      await flushPromises();
    });

    // After disconnect, balances should reset to 0 in global state
    expect(stateResult.current.publicUsdc).toBe(0);
    expect(stateResult.current.shieldedUsdc).toBe(0);
  });

  it('accepts custom connection, usdcMint, and refreshInterval', async () => {
    mockWalletState = {
      connected: true,
      publicKey: { toBase58: () => MOCK_PUBLIC_KEY },
    };

    const customConnection = { rpcEndpoint: 'https://custom.rpc.com' } as any;

    // Reset mock to default before this test
    mockGetAccount.mockImplementation(() => Promise.resolve({ amount: 1500000n }));

    const { result } = renderHook(
      () =>
        useWalletBalance({
          connection: customConnection,
          usdcMint: 'CustomMintAddress111111111111111111111111111111',
          refreshInterval: 2000,
        }),
      { wrapper }
    );

    await act(async () => {
      await flushPromises();
    });

    // Should still work with custom params
    expect(result.current.publicUsdc).toBe(1.5);
  });
});
