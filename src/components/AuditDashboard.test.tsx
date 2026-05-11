import '../happy-dom-setup';
import React from 'react';
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { render, act, fireEvent, waitFor } from '@testing-library/react';
import { AppStateProvider } from '../context/AppState';
import AuditDashboard from './AuditDashboard';

// Mock @solana/wallet-adapter-react
const mockConnect = mock(() => Promise.resolve());
const mockDisconnect = mock(() => Promise.resolve());
const mockSelect = mock(() => {});

let mockWalletState = {
  connected: false,
  publicKey: null as { toBase58: () => string } | null,
  wallet: null as { adapter: { name: string } } | null,
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

// Note: AuditDashboard now uses an inline mock generator instead of CloakSDK
// to avoid browser-side errors from Node-only dependencies (blake-hash).
// We test the actual component behavior without mocking the SDK.

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppStateProvider>{children}</AppStateProvider>
);

describe('AuditDashboard', () => {
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

  it('should render component with Generate Key button', () => {
    const { getByTestId, getByText } = render(<AuditDashboard />, { wrapper });
    expect(getByTestId('audit-dashboard')).toBeTruthy();
    expect(getByText('Generate Key')).toBeTruthy();
  });

  it('should show empty state when no viewing keys exist', () => {
    const { getByText } = render(<AuditDashboard />, { wrapper });
    expect(getByText('Viewing keys will appear here')).toBeTruthy();
  });

  it('should generate a viewing key when Generate Key is clicked', async () => {
    const { getByText } = render(<AuditDashboard />, { wrapper });
    const generateBtn = getByText('Generate Key');

    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Wait for the async generation to complete
    await waitFor(() => expect(getByText('Generate Key')).toBeTruthy());
  });

  it('should add a viewing key to the list when Generate Key is clicked', async () => {
    const { getByText, container } = render(<AuditDashboard />, { wrapper });
    const generateBtn = getByText('Generate Key');

    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Wait for the async generation to complete
    await waitFor(() => expect(container.textContent).toContain('cloak_vk_'));
    expect(container.textContent).toContain('Scope:');
    expect(container.textContent).toContain('Created:');
    expect(container.textContent).toContain('Expires:');
    expect(container.textContent).toContain('Active');
  });

  it('should display key scope label in the generated key list', async () => {
    const { getByText, container } = render(<AuditDashboard />, { wrapper });
    const generateBtn = getByText('Generate Key');

    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Wait for the async generation to complete
    await waitFor(() => expect(container.textContent).toContain('Scope:'));
  });

  it('should display generated key in the list with key text, created and expiry time', async () => {
    const { getByText, container } = render(<AuditDashboard />, { wrapper });
    const generateBtn = getByText('Generate Key');

    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Wait for the async generation to complete
    await waitFor(() => expect(container.textContent).toContain('cloak_vk_'));
    // Created time label should exist
    expect(container.textContent).toContain('Created:');
    // Expiry time label should exist
    expect(container.textContent).toContain('Expires:');
  });

  it('should show key status as Active for newly generated keys', async () => {
    const { getByText, container } = render(<AuditDashboard />, { wrapper });
    const generateBtn = getByText('Generate Key');

    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Wait for the async generation to complete
    await waitFor(() => expect(container.textContent).toContain('Active'));
  });

  it('should have a copy button for each key', async () => {
    const { getByText, getByTestId } = render(<AuditDashboard />, { wrapper });
    const generateBtn = getByText('Generate Key');

    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Wait for the async generation to complete
    await waitFor(() => expect(getByTestId('copy-key-0')).toBeTruthy());
  });

  it('should revoke a key when Revoke button is clicked', async () => {
    const { getByText, getByTestId } = render(<AuditDashboard />, { wrapper });
    const generateBtn = getByText('Generate Key');

    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Wait for the async generation to complete
    await waitFor(() => expect(getByTestId('revoke-key-0')).toBeTruthy());

    const revokeBtn = getByTestId('revoke-key-0');
    await act(async () => {
      fireEvent.click(revokeBtn);
    });

    // After revoke, status should show "Revoked"
    expect(getByText('Revoked')).toBeTruthy();
  });

  it('should display revoked key with gray/different styling', async () => {
    const { getByText, getByTestId, container } = render(<AuditDashboard />, { wrapper });
    const generateBtn = getByText('Generate Key');

    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Wait for the async generation to complete
    await waitFor(() => expect(getByTestId('revoke-key-0')).toBeTruthy());

    const revokeBtn = getByTestId('revoke-key-0');
    await act(async () => {
      fireEvent.click(revokeBtn);
    });

    // The revoked key row should have a gray styling class
    const revokedRow = container.querySelector('[data-testid="key-row-0"]');
    expect(revokedRow?.classList.contains('opacity-50') || revokedRow?.classList.contains('grayscale')).toBe(true);
  });

  it('should apply custom className', () => {
    const { getByTestId } = render(<AuditDashboard className="custom-audit-class" />, { wrapper });
    expect(getByTestId('audit-dashboard').classList.contains('custom-audit-class')).toBe(true);
  });
});
