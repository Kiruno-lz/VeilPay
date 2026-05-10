import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ClaimPage from './ClaimPage';
import { AppStateProvider } from '../context/AppState';

// Mock @solana/wallet-adapter-react to avoid provider requirements
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

function renderWithRouter(initialEntries: string[]) {
  return render(
    <AppStateProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <ClaimPage />
      </MemoryRouter>
    </AppStateProvider>
  );
}

describe('ClaimPage', () => {
  beforeEach(() => {
    // Reset any DOM state between tests
    document.body.innerHTML = '';
  });

  describe('with valid token', () => {
    it('renders the claim page', () => {
      const { getByTestId } = renderWithRouter(['/claim?token=eyJhbG...']);
      expect(getByTestId('claim-page')).toBeTruthy();
    });

    it('displays the token', () => {
      const { getByTestId } = renderWithRouter(['/claim?token=eyJhbG...']);
      expect(getByTestId('claim-token').textContent).toBe('eyJhbG...');
    });

    it('shows amount section', () => {
      const { getByTestId } = renderWithRouter(['/claim?token=eyJhbG...']);
      expect(getByTestId('claim-amount')).toBeTruthy();
    });

    it('shows wallet connection section', () => {
      const { getByTestId } = renderWithRouter(['/claim?token=eyJhbG...']);
      expect(getByTestId('connect-wallet-button')).toBeTruthy();
    });

    it('shows claim button', () => {
      const { getByTestId } = renderWithRouter(['/claim?token=eyJhbG...']);
      expect(getByTestId('claim-button')).toBeTruthy();
    });
  });

  describe('without token', () => {
    it('shows error message', () => {
      const { getByText, getByTestId } = renderWithRouter(['/claim']);
      expect(getByText('Invalid Claim Link')).toBeTruthy();
      expect(getByTestId('claim-error').textContent).toBe('Invalid or missing claim link');
    });

    it('does not show claim button', () => {
      const { queryByTestId } = renderWithRouter(['/claim']);
      expect(queryByTestId('claim-button')).toBeNull();
    });

    it('does not show amount section', () => {
      const { queryByTestId } = renderWithRouter(['/claim']);
      expect(queryByTestId('claim-amount')).toBeNull();
    });

    it('does not show connect wallet button', () => {
      const { queryByTestId } = renderWithRouter(['/claim']);
      expect(queryByTestId('connect-wallet-button')).toBeNull();
    });
  });

  describe('with empty token', () => {
    it('shows error message', () => {
      const { getByText, getByTestId } = renderWithRouter(['/claim?token=']);
      expect(getByText('Invalid Claim Link')).toBeTruthy();
      expect(getByTestId('claim-error').textContent).toBe('Invalid or missing claim link');
    });

    it('does not show claim button', () => {
      const { queryByTestId } = renderWithRouter(['/claim?token=']);
      expect(queryByTestId('claim-button')).toBeNull();
    });
  });
});
