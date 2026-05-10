import './happy-dom-setup';
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AppStateProvider } from './context/AppState';

// Mock @solana/wallet-adapter-react
const mockConnect = mock(() => Promise.resolve());
const mockDisconnect = mock(() => Promise.resolve());
const mockSelect = mock(() => {});

let mockWalletState = {
  connected: false,
  publicKey: null,
  wallet: null,
  wallets: [],
  connect: mockConnect,
  disconnect: mockDisconnect,
  select: mockSelect,
};

mock.module('@solana/wallet-adapter-react', () => ({
  useWallet: () => mockWalletState,
  WalletProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ConnectionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

mock.module('@solana/wallet-adapter-react-ui', () => ({
  WalletModalProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  WalletMultiButton: () => <button>Connect Wallet</button>,
}));

describe('App routing', () => {
  beforeEach(() => {
    mockWalletState = {
      connected: false,
      publicKey: null,
      wallet: null,
      wallets: [],
      connect: mockConnect,
      disconnect: mockDisconnect,
      select: mockSelect,
    };
  });

  it('should render AdminPage at /', () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppStateProvider>
          <App />
        </AppStateProvider>
      </MemoryRouter>
    );
    expect(getByTestId('admin-page')).toBeTruthy();
  });

  it('should render ClaimPage at /claim with query param', () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/claim?token=eyJhbG...']}>
        <App />
      </MemoryRouter>
    );
    expect(getByTestId('claim-page')).toBeTruthy();
  });

  it('should render AuditPage at /audit', () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/audit']}>
        <App />
      </MemoryRouter>
    );
    expect(getByTestId('audit-page')).toBeTruthy();
  });

  it('should render NotFoundPage for unknown routes', () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/unknown']}>
        <App />
      </MemoryRouter>
    );
    expect(getByTestId('not-found-page')).toBeTruthy();
  });
});
