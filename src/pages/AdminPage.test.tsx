import '../happy-dom-setup';
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppStateProvider } from '../context/AppState';
import AdminPage from './AdminPage';

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

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <AppStateProvider>{children}</AppStateProvider>
    </MemoryRouter>
  );
}

describe('AdminPage', () => {
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

  it('should render admin page with test id', () => {
    const { getByTestId } = render(<AdminPage />, { wrapper: Wrapper });
    expect(getByTestId('admin-page')).toBeTruthy();
  });

  it('should render 4 step sections', () => {
    const { container } = render(<AdminPage />, { wrapper: Wrapper });
    const stepSections = container.querySelectorAll('[data-testid^="step-"]');
    expect(stepSections.length).toBe(4);
  });

  it('should render step numbers 1-4', () => {
    const { container } = render(<AdminPage />, { wrapper: Wrapper });
    // Step numbers are rendered as step indicators by AdminPage
    const stepNumbers = container.querySelectorAll('[data-testid^="step-"]');
    expect(stepNumbers.length).toBe(4);
    expect(stepNumbers[0].getAttribute('data-testid')).toBe('step-1');
    expect(stepNumbers[1].getAttribute('data-testid')).toBe('step-2');
    expect(stepNumbers[2].getAttribute('data-testid')).toBe('step-3');
    expect(stepNumbers[3].getAttribute('data-testid')).toBe('step-4');
  });

  it('should render step titles', () => {
    const { container } = render(<AdminPage />, { wrapper: Wrapper });
    const h2s = container.querySelectorAll('h2');
    const titles = Array.from(h2s).map(h => h.textContent);
    expect(titles).toContain('Upload Recipients');
    expect(titles).toContain('Deposit Funds');
    expect(titles).toContain('Disburse');
    expect(titles).toContain('Audit');
  });

  it('should render header with VeilPay logo', () => {
    const { getByText } = render(<AdminPage />, { wrapper: Wrapper });
    expect(getByText('VeilPay')).toBeTruthy();
  });

  it('should render UploadCSV placeholder', () => {
    const { container } = render(<AdminPage />, { wrapper: Wrapper });
    expect(container.textContent).toContain('Drag & drop CSV file here');
  });

  it('should render DepositCard placeholder', () => {
    const { container } = render(<AdminPage />, { wrapper: Wrapper });
    expect(container.textContent).toContain('Connect wallet to deposit');
  });

  it('should render DisburseForm placeholder', () => {
    const { container } = render(<AdminPage />, { wrapper: Wrapper });
    expect(container.textContent).toContain('No recipients yet');
  });

  it('should render AuditDashboard placeholder', () => {
    const { container } = render(<AdminPage />, { wrapper: Wrapper });
    expect(container.textContent).toContain('Viewing keys will appear here');
  });
});
