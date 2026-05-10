import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { render, fireEvent } from '@testing-library/react';
import { ConnectWallet } from './ConnectWallet';
import { AppStateProvider } from '../context/AppState';

// Mock useWallet hook
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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppStateProvider>{children}</AppStateProvider>
);

describe('ConnectWallet', () => {
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
    mockDisconnect.mockClear();
    mockSelectWallet.mockClear();
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
    const { getByTestId } = render(<ConnectWallet />, { wrapper });
    fireEvent.click(getByTestId('connect-button'));
    fireEvent.click(getByTestId('wallet-option-phantom'));

    expect(mockSelectWallet).toHaveBeenCalledWith('Phantom');
    expect(mockConnect).toHaveBeenCalled();
  });

  it('renders shortened address and disconnect button when connected', () => {
    mockWalletState = {
      ...mockWalletState,
      connected: true,
      publicKey: '7x9k2LmNpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz',
      walletName: 'Phantom',
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
      publicKey: '7x9k2LmNpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz',
      walletName: 'Phantom',
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
