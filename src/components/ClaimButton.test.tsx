import '../happy-dom-setup';
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ClaimButton } from './ClaimButton';
import { AppStateProvider } from '../context/AppState';

// ── Mock the custom useWallet hook directly ───────────────────────────────
const mockConnect = mock(() => Promise.resolve());
const mockDisconnect = mock(() => Promise.resolve());
const mockSelectWallet = mock(() => {});

let mockWalletState = {
  connected: false,
  publicKey: null as string | null,
  walletName: null as string | null,
  connect: mockConnect,
  disconnect: mockDisconnect,
  selectWallet: mockSelectWallet,
};

mock.module('../hooks/useWallet', () => ({
  useWallet: () => mockWalletState,
}));

// ── Mock CloakSDK ────────────────────────────────────────────────────────
const mockReceive = mock(() => Promise.resolve({ txHash: 'mock-tx-hash-12345' }));

mock.module('../lib/cloak', () => ({
  CloakSDK: class MockCloakSDK {
    constructor(_config: any) {}
    receive = mockReceive;
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppStateProvider>{children}</AppStateProvider>
);

const defaultProps = {
  commitment: 'test-commitment-123',
  note: 'test-note-456',
};

describe('ClaimButton', () => {
  beforeEach(() => {
    mockWalletState = {
      connected: false,
      publicKey: null,
      walletName: null,
      connect: mockConnect,
      disconnect: mockDisconnect,
      selectWallet: mockSelectWallet,
    };
    mockConnect.mockClear();
    mockReceive.mockClear();
  });

  describe('when wallet is not connected', () => {
    it('renders "Connect Wallet to Claim" button', () => {
      const { getByTestId, getByText } = render(
        <ClaimButton {...defaultProps} />,
        { wrapper }
      );
      expect(getByTestId('connect-wallet-button')).toBeTruthy();
      expect(getByText('Connect Wallet to Claim')).toBeTruthy();
    });

    it('calls connect when connect button is clicked', async () => {
      const { getByTestId } = render(
        <ClaimButton {...defaultProps} />,
        { wrapper }
      );
      fireEvent.click(getByTestId('connect-wallet-button'));

      // Wait for async connect to be called
      await waitFor(() => expect(mockConnect).toHaveBeenCalled());
    });

    it('shows helper text', () => {
      const { getByTestId } = render(
        <ClaimButton {...defaultProps} />,
        { wrapper }
      );
      expect(getByTestId('claim-status').textContent).toBe('Connect your wallet to claim your USDC');
    });
  });

  describe('when wallet is connected', () => {
    beforeEach(() => {
      mockWalletState = {
        ...mockWalletState,
        connected: true,
        publicKey: '7x9k2LmNpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz',
        walletName: 'Phantom',
      };
    });

    it('renders "Claim USDC" button', () => {
      const { getByTestId, getByText } = render(
        <ClaimButton {...defaultProps} />,
        { wrapper }
      );
      expect(getByTestId('claim-button')).toBeTruthy();
      expect(getByText('Claim USDC')).toBeTruthy();
    });

    it('calls CloakSDK.receive when claim button is clicked', async () => {
      const { getByTestId } = render(
        <ClaimButton {...defaultProps} />,
        { wrapper }
      );
      fireEvent.click(getByTestId('claim-button'));

      await waitFor(() => expect(mockReceive).toHaveBeenCalled());
      expect(mockReceive).toHaveBeenCalledWith({
        commitment: defaultProps.commitment,
        note: defaultProps.note,
      });
    });

    it('shows loading state while claiming', async () => {
      // Make receive take some time
      mockReceive.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ txHash: 'tx123' }), 100)));

      const { getByTestId, getByText } = render(
        <ClaimButton {...defaultProps} />,
        { wrapper }
      );
      fireEvent.click(getByTestId('claim-button'));

      // Should show claiming state immediately
      expect(getByText('Claiming...')).toBeTruthy();
      expect(getByTestId('claim-status').textContent).toContain('Processing');
    });

    it('shows success state after successful claim', async () => {
      mockReceive.mockResolvedValue({ txHash: 'success-tx-hash-abc123' });

      const { getByTestId, getByText } = render(
        <ClaimButton {...defaultProps} />,
        { wrapper }
      );
      fireEvent.click(getByTestId('claim-button'));

      await waitFor(() => expect(getByText('Claim Successful!')).toBeTruthy());
      expect(getByTestId('tx-signature').textContent).toBe('success-tx-hash-abc123');
      expect(getByTestId('tx-signature-link')).toBeTruthy();
    });

    it('calls onSuccess callback with txHash', async () => {
      const onSuccess = mock(() => {});
      mockReceive.mockResolvedValue({ txHash: 'callback-tx-hash' });

      const { getByTestId } = render(
        <ClaimButton {...defaultProps} onSuccess={onSuccess} />,
        { wrapper }
      );
      fireEvent.click(getByTestId('claim-button'));

      await waitFor(() => expect(onSuccess).toHaveBeenCalled());
      expect(onSuccess).toHaveBeenCalledWith('callback-tx-hash');
    });

    it('shows error state when claim fails', async () => {
      mockReceive.mockRejectedValue(new Error('Network error: timeout'));

      const { getByTestId, getByText } = render(
        <ClaimButton {...defaultProps} />,
        { wrapper }
      );
      fireEvent.click(getByTestId('claim-button'));

      await waitFor(() => expect(getByText('Claim Failed')).toBeTruthy());
      expect(getByTestId('claim-error-message').textContent).toBe('Network error: timeout');
      expect(getByTestId('retry-claim-button')).toBeTruthy();
    });

    it('calls onError callback with error', async () => {
      const onError = mock(() => {});
      const error = new Error('Claim failed');
      mockReceive.mockRejectedValue(error);

      const { getByTestId } = render(
        <ClaimButton {...defaultProps} onError={onError} />,
        { wrapper }
      );
      fireEvent.click(getByTestId('claim-button'));

      await waitFor(() => expect(onError).toHaveBeenCalled());
      expect(onError).toHaveBeenCalledWith(error);
    });

    it('allows retry after error', async () => {
      mockReceive.mockRejectedValueOnce(new Error('First attempt failed'));

      const { getByTestId, queryByTestId } = render(
        <ClaimButton {...defaultProps} />,
        { wrapper }
      );
      fireEvent.click(getByTestId('claim-button'));

      await waitFor(() => expect(getByTestId('retry-claim-button')).toBeTruthy());

      // Now make it succeed on retry
      mockReceive.mockResolvedValueOnce({ txHash: 'retry-success' });
      fireEvent.click(getByTestId('retry-claim-button'));

      // Should show success state after retry succeeds
      await waitFor(() => expect(getByTestId('claim-success')).toBeTruthy());
      // After success, retry button should be gone
      expect(queryByTestId('retry-claim-button')).toBeNull();
    });

    it('disables claim button while claiming', async () => {
      mockReceive.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ txHash: 'tx' }), 200)));

      const { getByTestId } = render(
        <ClaimButton {...defaultProps} />,
        { wrapper }
      );
      const button = getByTestId('claim-button') as HTMLButtonElement;

      expect(button.disabled).toBe(false);
      fireEvent.click(button);

      await waitFor(() => expect(button.disabled).toBe(true));
    });

    it('generates correct explorer URL for devnet', async () => {
      mockReceive.mockResolvedValue({ txHash: 'devnet-tx' });

      const { getByTestId } = render(
        <ClaimButton {...defaultProps} />,
        { wrapper }
      );
      fireEvent.click(getByTestId('claim-button'));

      await waitFor(() => expect(getByTestId('tx-signature-link')).toBeTruthy());
      const link = getByTestId('tx-signature-link') as HTMLAnchorElement;
      expect(link.href).toContain('explorer.solana.com/tx/devnet-tx');
      expect(link.href).toContain('cluster=devnet');
    });
  });

  describe('explorer URL generation', () => {
    beforeEach(() => {
      mockWalletState = {
        ...mockWalletState,
        connected: true,
        publicKey: 'abc',
        walletName: 'Phantom',
      };
    });

    it('uses devnet cluster param by default', async () => {
      mockReceive.mockResolvedValue({ txHash: 'test-tx' });

      const { getByTestId } = render(
        <ClaimButton {...defaultProps} />,
        { wrapper }
      );
      fireEvent.click(getByTestId('claim-button'));

      await waitFor(() => expect(getByTestId('tx-signature-link')).toBeTruthy());
      const link = getByTestId('tx-signature-link') as HTMLAnchorElement;
      expect(link.href).toContain('cluster=devnet');
    });
  });
});
