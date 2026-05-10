import '../happy-dom-setup';
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { render, fireEvent } from '@testing-library/react';
import { ConnectWallet } from './ConnectWallet';
import { AppStateProvider } from '../context/AppState';

// Mock @solana/wallet-adapter-react (used by useWallet hook)
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
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppStateProvider>{children}</AppStateProvider>
);

describe('ConnectWallet', () => {
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
    mockConnect.mockClear();
    mockDisconnect.mockClear();
    mockSelect.mockClear();
  });

  it('renders connect button when disconnected', () => {
    const { getByTestId, getByText } = render(<ConnectWallet />, { wrapper });
    expect(getByTestId('connect-button')).toBeTruthy();
    expect(getByText('Connect Wallet')).toBeTruthy();
  });

  it('shows wallet options when connect button is clicked', () => {
    const { getByTestId } = render(<ConnectWallet />, { wrapper });
    fireEvent.click(getByTestId('connect-button'));

    expect(getByTestId('wallet-option-phantom')).toBeTruthy();
    expect(getByTestId('wallet-option-solflare')).toBeTruthy();
    expect(getByTestId('wallet-option-backpack')).toBeTruthy();
  });

  it('calls selectWallet and connect when a wallet is selected', async () => {
    // Set wallet so connect() doesn't throw "No wallet selected"
    mockWalletState = {
      ...mockWalletState,
      wallet: { adapter: { name: 'Phantom' } },
    };

    const { getByTestId } = render(<ConnectWallet />, { wrapper });
    fireEvent.click(getByTestId('connect-button'));
    fireEvent.click(getByTestId('wallet-option-phantom'));

    // Note: The hook calls select() on the solana adapter, then connect()
    // We verify the connect was called (select is called internally by the hook)
    expect(mockConnect).toHaveBeenCalled();
  });

  it('renders shortened address and disconnect button when connected', () => {
    mockWalletState = {
      ...mockWalletState,
      connected: true,
      publicKey: { toBase58: () => '7x9k2LmNpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz' },
      wallet: { adapter: { name: 'Phantom' } },
    };

    const { getByText, getByTestId } = render(<ConnectWallet />, { wrapper });

    expect(getByText('7x9k...WxYz')).toBeTruthy();
    expect(getByTestId('disconnect-button')).toBeTruthy();
    expect(getByText('Disconnect')).toBeTruthy();
  });

  it('calls disconnect when disconnect button is clicked', () => {
    mockWalletState = {
      ...mockWalletState,
      connected: true,
      publicKey: { toBase58: () => '7x9k2LmNpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz' },
      wallet: { adapter: { name: 'Phantom' } },
    };

    const { getByTestId } = render(<ConnectWallet />, { wrapper });
    fireEvent.click(getByTestId('disconnect-button'));

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(<ConnectWallet className="custom-class" />, { wrapper });
    expect(container.firstElementChild?.classList.contains('custom-class')).toBe(true);
  });
});
