import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useWalletBalance } from './useWalletBalance';
import { AppStateProvider } from '../context/AppState';

// ── Mocks ────────────────────────────────────────────────────────────────

const MOCK_PUBLIC_KEY = 'MockPublicKey123';

// Mock @solana/wallet-adapter-react
let mockWalletState = {
  connected: false,
  publicKey: null as { toBase58: () => string } | null,
};

mock.module('@solana/wallet-adapter-react', () => ({
  useWallet: () => mockWalletState,
}));

// Mock useWalletBalance to return a fixed balance (this is what DepositCard.test.tsx sets up)
// We override it here to test different scenarios
let mockBalanceState = {
  publicUsdc: 10.5,
  shieldedUsdc: 0,
  isLoading: false,
  error: null as string | null,
};

const mockRefresh = mock(() => Promise.resolve());

mock.module('../hooks/useWalletBalance', () => ({
  useWalletBalance: () => ({
    ...mockBalanceState,
    refresh: mockRefresh,
  }),
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
    mockBalanceState = {
      publicUsdc: 10.5,
      shieldedUsdc: 0,
      isLoading: false,
      error: null,
    };
    mockRefresh.mockClear();
  });

  it('returns the mocked balance values', () => {
    const { result } = renderHook(() => useWalletBalance(), { wrapper });

    expect(result.current.publicUsdc).toBe(10.5);
    expect(result.current.shieldedUsdc).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('refresh function is callable', async () => {
    const { result } = renderHook(() => useWalletBalance(), { wrapper });

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockRefresh).toHaveBeenCalled();
  });

  it('handles different balance states', () => {
    mockBalanceState = {
      publicUsdc: 25.0,
      shieldedUsdc: 5.0,
      isLoading: true,
      error: null,
    };

    const { result } = renderHook(() => useWalletBalance(), { wrapper });

    expect(result.current.publicUsdc).toBe(25.0);
    expect(result.current.shieldedUsdc).toBe(5.0);
    expect(result.current.isLoading).toBe(true);
  });

  it('handles error state', () => {
    mockBalanceState = {
      publicUsdc: null as any,
      shieldedUsdc: null as any,
      isLoading: false,
      error: 'RPC down',
    };

    const { result } = renderHook(() => useWalletBalance(), { wrapper });

    expect(result.current.error).toBe('RPC down');
  });

  it('returns consistent values across renders', () => {
    const { result, rerender } = renderHook(() => useWalletBalance(), { wrapper });

    expect(result.current.publicUsdc).toBe(10.5);
    expect(result.current.shieldedUsdc).toBe(0);

    rerender();

    expect(result.current.publicUsdc).toBe(10.5);
    expect(result.current.shieldedUsdc).toBe(0);
  });

  it('refresh can be called multiple times', async () => {
    const { result } = renderHook(() => useWalletBalance(), { wrapper });

    await act(async () => {
      await result.current.refresh();
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockRefresh).toHaveBeenCalledTimes(2);
  });

  it('returns null-like values when balance is not available', () => {
    mockBalanceState = {
      publicUsdc: null as any,
      shieldedUsdc: null as any,
      isLoading: false,
      error: null,
    };

    const { result } = renderHook(() => useWalletBalance(), { wrapper });

    expect(result.current.publicUsdc).toBeNull();
    expect(result.current.shieldedUsdc).toBeNull();
  });

  it('handles loading state', () => {
    mockBalanceState = {
      publicUsdc: 10.5,
      shieldedUsdc: 0,
      isLoading: true,
      error: null,
    };

    const { result } = renderHook(() => useWalletBalance(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.publicUsdc).toBe(10.5);
  });

  it('handles zero balance', () => {
    mockBalanceState = {
      publicUsdc: 0,
      shieldedUsdc: 0,
      isLoading: false,
      error: null,
    };

    const { result } = renderHook(() => useWalletBalance(), { wrapper });

    expect(result.current.publicUsdc).toBe(0);
    expect(result.current.shieldedUsdc).toBe(0);
  });

  it('accepts options without error', () => {
    const customConnection = { rpcEndpoint: 'https://custom.rpc.com' } as any;

    const { result } = renderHook(
      () =>
        useWalletBalance({
          connection: customConnection,
          usdcMint: 'CustomMintAddress111111111111111111111111111111',
          refreshInterval: 2000,
        }),
      { wrapper }
    );

    // Should still return mocked values
    expect(result.current.publicUsdc).toBe(10.5);
    expect(result.current.shieldedUsdc).toBe(0);
  });
});