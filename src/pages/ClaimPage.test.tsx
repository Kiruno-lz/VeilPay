import '../happy-dom-setup';
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ClaimPage from './ClaimPage';
import { AppStateProvider } from '../context/AppState';
import type { ClaimPayload } from '../lib/claimLink';

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

// Mock parseClaimToken
const mockParseClaimToken = mock(() => Promise.resolve<ClaimPayload | null>(null));

mock.module('../lib/claimLink', () => ({
  parseClaimToken: (token: string) => mockParseClaimToken(token),
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
    mockParseClaimToken.mockClear();
  });

  describe('with valid token', () => {
    it('renders the claim page', async () => {
      mockParseClaimToken.mockResolvedValue({
        commitment: 'abc123',
        note: 'test note',
        amount: 1234.56,
        recipient: 'recipient-address',
      });
      const { getByTestId } = renderWithRouter(['/claim?token=eyJhbG...']);
      await waitFor(() => expect(getByTestId('claim-page')).toBeTruthy());
    });

    it('displays the token', async () => {
      mockParseClaimToken.mockResolvedValue({
        commitment: 'abc123',
        note: 'test note',
        amount: 1234.56,
        recipient: 'recipient-address',
      });
      const { getByTestId } = renderWithRouter(['/claim?token=eyJhbG...']);
      await waitFor(() => expect(getByTestId('claim-token').textContent).toBe('eyJhbG...'));
    });

    it('shows parsed amount for valid token', async () => {
      mockParseClaimToken.mockResolvedValue({
        commitment: 'abc123',
        note: 'test note',
        amount: 1234.56,
        recipient: 'recipient-address',
      });
      const { getByTestId, getByText } = renderWithRouter(['/claim?token=eyJhbG...']);
      await waitFor(() => expect(getByTestId('claim-amount')).toBeTruthy());
      expect(getByText((content) => content.includes('1,234.56') && content.includes('USDC'))).toBeTruthy();
    });

    it('shows sender for valid token', async () => {
      mockParseClaimToken.mockResolvedValue({
        commitment: 'abc123',
        note: 'test note',
        amount: 100,
        recipient: 'recipient-address',
      });
      const { getByTestId, getByText } = renderWithRouter(['/claim?token=eyJhbG...']);
      await waitFor(() => expect(getByTestId('claim-sender')).toBeTruthy());
      expect(getByText((content) => content.includes('VeilPay Admin'))).toBeTruthy();
    });

    it('shows wallet connection section', async () => {
      mockParseClaimToken.mockResolvedValue({
        commitment: 'abc123',
        note: 'test note',
        amount: 1234.56,
        recipient: 'recipient-address',
      });
      const { getByTestId } = renderWithRouter(['/claim?token=eyJhbG...']);
      await waitFor(() => expect(getByTestId('claim-wallet-section')).toBeTruthy());
    });

    it('shows claim button area', async () => {
      mockParseClaimToken.mockResolvedValue({
        commitment: 'abc123',
        note: 'test note',
        amount: 1234.56,
        recipient: 'recipient-address',
      });
      const { getByTestId } = renderWithRouter(['/claim?token=eyJhbG...']);
      await waitFor(() => expect(getByTestId('claim-status')).toBeTruthy());
    });
  });

  describe('with invalid token', () => {
    it('shows error state from ClaimDetails', async () => {
      mockParseClaimToken.mockResolvedValue(null);
      const { getByTestId, getByText } = renderWithRouter(['/claim?token=invalid-token']);
      await waitFor(() => expect(getByTestId('claim-error')).toBeTruthy());
      expect(getByText('Invalid Claim Link')).toBeTruthy();
    });

    it('shows claim button area for invalid token', async () => {
      mockParseClaimToken.mockResolvedValue(null);
      const { getByTestId } = renderWithRouter(['/claim?token=invalid-token']);
      await waitFor(() => expect(getByTestId('claim-error')).toBeTruthy());
      const status = getByTestId('claim-status');
      expect(status).toBeTruthy();
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
