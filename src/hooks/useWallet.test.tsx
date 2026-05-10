import '../happy-dom-setup';
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { renderHook, act } from '@testing-library/react';
import { useWallet } from './useWallet';
import { AppStateProvider } from '../context/AppState';

// Mock @solana/wallet-adapter-react
const mockConnect = mock(() => Promise.resolve());
const mockDisconnect = mock(() => {
  mockWalletStateRef.current.connected = false;
  mockWalletStateRef.current.publicKey = null;
  mockWalletStateRef.current.wallet = null;
  return Promise.resolve();
});
const mockSelect = mock(() => {});

// Use a ref object so the mock module always sees the current state
const mockWalletStateRef = {
  current: {
    connected: false,
    publicKey: null,
    wallet: null,
    wallets: [],
    connect: mockConnect,
    disconnect: mockDisconnect,
    select: mockSelect,
  },
};

mock.module('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    get connected() { return mockWalletStateRef.current.connected; },
    get publicKey() { return mockWalletStateRef.current.publicKey; },
    get wallet() { return mockWalletStateRef.current.wallet; },
    get wallets() { return mockWalletStateRef.current.wallets; },
    connect: mockConnect,
    disconnect: mockDisconnect,
    select: mockSelect,
  }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppStateProvider>{children}</AppStateProvider>
);

describe('useWallet', () => {
  beforeEach(() => {
    mockWalletStateRef.current = {
      connected: false,
      publicKey: null,
      wallet: null,
      wallets: [],
      connect: mockConnect,
      disconnect: mockDisconnect,
      select: mockSelect,
    };
    mockConnect.mockClear();
    mockDisconnect.mockClear();
    mockSelect.mockClear();
  });

  it('returns disconnected state initially', () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    expect(result.current.connected).toBe(false);
    expect(result.current.publicKey).toBeNull();
    expect(result.current.walletName).toBeNull();
  });

  it('shows correct wallet name after selection', () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    act(() => {
      result.current.selectWallet('Phantom');
    });

    // After selection, the hook sets local state and calls solanaWallet.select
    expect(result.current.walletName).toBe('Phantom');
  });

  it('updates connected state and publicKey on connect', async () => {
    mockWalletStateRef.current = {
      ...mockWalletStateRef.current,
      connected: true,
      publicKey: { toBase58: () => 'ABC123xyz789' },
      wallet: { adapter: { name: 'Phantom' } },
    };

    const { result, rerender } = renderHook(() => useWallet(), { wrapper });

    // Trigger connect
    await act(async () => {
      await result.current.connect();
    });

    // Simulate the wallet adapter state update after connect
    rerender();

    expect(result.current.connected).toBe(true);
    expect(result.current.publicKey).toBe('ABC123xyz789');
  });

  it('resets state to null on disconnect', async () => {
    mockWalletStateRef.current = {
      ...mockWalletStateRef.current,
      connected: true,
      publicKey: { toBase58: () => 'ABC123xyz789' },
      wallet: { adapter: { name: 'Phantom' } },
    };

    const { result, rerender } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.disconnect();
    });

    // Simulate the wallet adapter state update after disconnect
    mockWalletStateRef.current.connected = false;
    mockWalletStateRef.current.publicKey = null;
    mockWalletStateRef.current.wallet = null;
    rerender();

    expect(result.current.connected).toBe(false);
    expect(result.current.publicKey).toBeNull();
  });

  it('dispatches SET_WALLET on connect', async () => {
    mockWalletStateRef.current = {
      ...mockWalletStateRef.current,
      connected: true,
      publicKey: { toBase58: () => 'ABC123xyz789' },
      wallet: { adapter: { name: 'Phantom' } },
    };

    const { result, rerender } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.connect();
    });

    // Simulate the wallet adapter state update after connect
    rerender();

    // The hook should have dispatched SET_WALLET with the public key
    expect(result.current.connected).toBe(true);
    expect(result.current.publicKey).toBe('ABC123xyz789');
  });

  it('dispatches SET_WALLET null on disconnect', async () => {
    mockWalletStateRef.current = {
      ...mockWalletStateRef.current,
      connected: true,
      publicKey: { toBase58: () => 'ABC123xyz789' },
      wallet: { adapter: { name: 'Phantom' } },
    };

    const { result, rerender } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.disconnect();
    });

    // Simulate the wallet adapter state update after disconnect
    mockWalletStateRef.current.connected = false;
    mockWalletStateRef.current.publicKey = null;
    mockWalletStateRef.current.wallet = null;
    rerender();

    expect(result.current.connected).toBe(false);
    expect(result.current.publicKey).toBeNull();
  });
});
