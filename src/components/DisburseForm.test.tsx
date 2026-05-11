import '../happy-dom-setup';
import { describe, it, expect, beforeEach, afterAll, mock } from 'bun:test';
import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import DisburseForm from './DisburseForm';
import { AppStateProvider } from '../context/AppState';
import { useAppState } from '../context/useAppState';

// ── Mocks ────────────────────────────────────────────────────────────────

// Mock CloakSDK - add small delay so progress state is visible
const mockTransfer = mock(() =>
  new Promise((resolve) => setTimeout(() => resolve({ txHash: 'mockTxHash123' }), 50))
);

mock.module('../lib/cloak', () => ({
  CloakSDK: class MockCloakSDK {
    constructor(_config: { network: string }) {}
    transfer = mockTransfer;
  },
}));

// Mock jose
mock.module('jose', () => ({
  SignJWT: class MockSignJWT {
    private payload: Record<string, unknown>;
    constructor(payload: Record<string, unknown>) {
      this.payload = payload;
    }
    setProtectedHeader(_header: unknown) {
      return this;
    }
    setIssuedAt() {
      return this;
    }
    async sign(_key: unknown): Promise<string> {
      return 'mock-jwt-token';
    }
  },
  importJWK: mock(() => Promise.resolve({})),
}));

// Mock navigator.clipboard
Object.defineProperty(global, 'navigator', {
  value: {
    clipboard: {
      writeText: mock(() => Promise.resolve()),
    },
  },
  writable: true,
  configurable: true,
});

// Restore original modules after tests to prevent leaking to other test files
afterAll(() => {
  mock.module('../lib/cloak', () => ({
    CloakSDK: class OriginalCloakSDK {
      private config: { network: string };
      constructor(config: { network: string }) {
        this.config = config;
      }
      get isLive() {
        return false;
      }
      get network() {
        return this.config.network;
      }
      get endpoint() {
        return this.config.network === 'devnet'
          ? 'https://api.devnet.solana.com'
          : 'https://api.mainnet-beta.solana.com';
      }
      setNetwork(network: string) {
        this.config = { ...this.config, network };
      }
      async deposit(params: { amount: number; token: string }) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { txHash: 'mockTxHash123' };
      }
      async transfer(params: { to: string; amount: number }) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { txHash: 'mockTxHash123' };
      }
      async receive(params: { commitment: string; note: string }) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { txHash: 'mockTxHash123' };
      }
      async generateViewingKey(params: { scope: string; expiry: number }) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return `cloak_vk_${params.scope}_${Date.now()}_mock`;
      }
      async decryptHistory(viewingKey: string) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return [
          {
            date: new Date(),
            amount: 100,
            recipient: '0xMockRecipient',
            type: 'transfer' as const,
            txHash: 'mockTxHash123',
          },
        ];
      }
      async _withTimeout<T>(promise: Promise<T>, operation: string, timeoutMs: number = 30000): Promise<T> {
        const timeoutPromise = new Promise<never>((_, reject) => {
          const timer = setTimeout(() => {
            clearTimeout(timer);
            reject(
              new Error(
                `Network timeout: ${operation} failed to complete on ${this.config.network} within ${timeoutMs / 1000}s`
              )
            );
          }, timeoutMs);
        });
        return Promise.race([promise, timeoutPromise]);
      }
    },
  }));
});

// Helper component to set up state - uses ref to avoid infinite loop
function TestWrapper({
  children,
  recipients = [],
  walletConnected = false,
}: {
  children: React.ReactNode;
  recipients?: Array<{ address: string; amount: number }>;
  walletConnected?: boolean;
}) {
  const { dispatch } = useAppState();
  const initialized = React.useRef(false);

  React.useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (walletConnected) {
      dispatch({
        type: 'SET_WALLET',
        payload: { connected: true, publicKey: 'MockPublicKey123', adapter: null },
      });
    }
    if (recipients.length > 0) {
      dispatch({ type: 'SET_RECIPIENTS', payload: recipients });
    }
  }, [dispatch, walletConnected, recipients]);

  return <>{children}</>;
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppStateProvider>{children}</AppStateProvider>
);

describe('DisburseForm', () => {
  beforeEach(() => {
    mockTransfer.mockClear();
  });

  it('renders with no recipients', () => {
    const { getByTestId, getByText } = render(<DisburseForm />, { wrapper });

    expect(getByTestId('disburse-form')).toBeTruthy();
    expect(getByTestId('no-recipients')).toBeTruthy();
    expect(getByText('No recipients yet. Upload a CSV first.')).toBeTruthy();
  });

  it('renders recipient list', async () => {
    const { getByTestId, getByText } = render(
      <AppStateProvider>
        <TestWrapper
          walletConnected={true}
          recipients={[
            { address: '6qGdef8G4ZCfB2cX3YGi5LAmEZTpVpTNEBZgfJFFG7Wk', amount: 1_000_000 },
            { address: 'FRkV74AHNrFNtPcxxTiGEozei83mcfbiMxRj4SQuH9un', amount: 2_500_000 },
          ]}
        >
          <DisburseForm />
        </TestWrapper>
      </AppStateProvider>
    );

    await waitFor(() => {
      expect(getByTestId('recipient-list')).toBeTruthy();
    });

    // Check masked addresses and amounts
    expect(getByText('6qGd...G7Wk')).toBeTruthy();
    expect(getByText('FRkV...H9un')).toBeTruthy();
    expect(getByText('1.00 USDC')).toBeTruthy();
    expect(getByText('2.50 USDC')).toBeTruthy();
  });

  it('click disburse → shows progress', async () => {
    const { getByTestId, getByRole } = render(
      <AppStateProvider>
        <TestWrapper
          walletConnected={true}
          recipients={[
            { address: '6qGdef8G4ZCfB2cX3YGi5LAmEZTpVpTNEBZgfJFFG7Wk', amount: 1_000_000 },
          ]}
        >
          <DisburseForm />
        </TestWrapper>
      </AppStateProvider>
    );

    // Wait for recipients to render
    await waitFor(() => {
      expect(getByTestId('recipient-list')).toBeTruthy();
    });

    const button = getByRole('button', { name: /disburse/i });
    fireEvent.click(button);

    // Should show progress section
    await waitFor(() => {
      expect(getByTestId('progress-section')).toBeTruthy();
    });

    expect(getByTestId('progress-text').textContent).toContain('Processing');
  });

  it('completion state shows claim links', async () => {
    const { getByTestId, getByRole, getByText } = render(
      <AppStateProvider>
        <TestWrapper
          walletConnected={true}
          recipients={[
            { address: '6qGdef8G4ZCfB2cX3YGi5LAmEZTpVpTNEBZgfJFFG7Wk', amount: 1_000_000 },
          ]}
        >
          <DisburseForm />
        </TestWrapper>
      </AppStateProvider>
    );

    await waitFor(() => {
      expect(getByTestId('recipient-list')).toBeTruthy();
    });

    fireEvent.click(getByRole('button', { name: /disburse/i }));

    // Wait for completion
    await waitFor(() => {
      expect(getByTestId('completed-section')).toBeTruthy();
    });

    expect(getByText('All disbursements completed!')).toBeTruthy();
    expect(getByTestId('completion-summary').textContent).toContain('1 of 1 successful');
    expect(getByTestId('claim-link-0')).toBeTruthy();
  });

  it('error state shows retry button', async () => {
    // Make transfer fail
    mockTransfer.mockImplementation(() => Promise.reject(new Error('Transfer failed')));

    const { getByTestId, getByRole } = render(
      <AppStateProvider>
        <TestWrapper
          walletConnected={true}
          recipients={[
            { address: '6qGdef8G4ZCfB2cX3YGi5LAmEZTpVpTNEBZgfJFFG7Wk', amount: 1_000_000 },
          ]}
        >
          <DisburseForm />
        </TestWrapper>
      </AppStateProvider>
    );

    await waitFor(() => {
      expect(getByTestId('recipient-list')).toBeTruthy();
    });

    fireEvent.click(getByRole('button', { name: /disburse/i }));

    // Wait for error state
    await waitFor(() => {
      expect(getByTestId('error-section')).toBeTruthy();
    });

    expect(getByTestId('retry-button')).toBeTruthy();
    expect(getByTestId('skip-button')).toBeTruthy();
  });

  it('button disabled when no wallet connected', async () => {
    const { getByRole, getByTestId } = render(
      <AppStateProvider>
        <TestWrapper
          walletConnected={false}
          recipients={[
            { address: '6qGdef8G4ZCfB2cX3YGi5LAmEZTpVpTNEBZgfJFFG7Wk', amount: 1_000_000 },
          ]}
        >
          <DisburseForm />
        </TestWrapper>
      </AppStateProvider>
    );

    await waitFor(() => {
      expect(getByTestId('recipient-list')).toBeTruthy();
    });

    const button = getByRole('button', { name: /disburse/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(getByTestId('connect-wallet-message')).toBeTruthy();
  });

  it('button disabled when no recipients', () => {
    const { getByRole } = render(
      <AppStateProvider>
        <TestWrapper walletConnected={true}>
          <DisburseForm />
        </TestWrapper>
      </AppStateProvider>
    );

    const button = getByRole('button', { name: /disburse/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
