import './happy-dom-setup';
import { describe, it, expect, mock } from 'bun:test';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AppStateProvider } from './context/AppState';

// Mock @solana/wallet-adapter-react to avoid provider requirements in routing tests
mock.module('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    connected: false,
    publicKey: null,
    wallet: null,
    wallets: [],
    connect: () => Promise.resolve(),
    disconnect: () => Promise.resolve(),
    select: () => {},
  }),
  useConnection: () => ({ connection: null }),
}));

function renderWithProvider(initialEntries: string[]) {
  return render(
    <AppStateProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </AppStateProvider>
  );
}

describe('App routing', () => {
  it('should render AdminPage at /', () => {
    const { getByTestId } = renderWithProvider(['/']);
    expect(getByTestId('admin-page')).toBeTruthy();
  });

  it('should render ClaimPage at /claim with query param', () => {
    const { getByTestId } = renderWithProvider(['/claim?token=eyJhbG...']);
    expect(getByTestId('claim-page')).toBeTruthy();
  });

  it('should render AuditPage at /audit', () => {
    const { getByTestId } = renderWithProvider(['/audit']);
    expect(getByTestId('audit-page')).toBeTruthy();
  });

  it('should render NotFoundPage for unknown routes', () => {
    const { getByTestId } = renderWithProvider(['/unknown']);
    expect(getByTestId('not-found-page')).toBeTruthy();
  });
});
