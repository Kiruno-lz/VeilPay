import '../happy-dom-setup';
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { AppStateProvider, appReducer } from '../context/AppState';
import { AppContext } from '../context/AppContext';
import type { AppState, Recipient } from '../types';
import DisburseForm from './DisburseForm';

// ── Mocks ────────────────────────────────────────────────────────────────

const MOCK_PUBLIC_KEY = 'MockPublicKey123';

let mockWalletState = {
  connected: false,
  publicKey: null as string | null,
  signTransaction: null as ((tx: any) => Promise<any>) | null,
};

mock.module('../hooks/useWallet', () => ({
  useWallet: () => mockWalletState,
}));

const mockTransfer = mock(() => Promise.resolve({ txHash: 'mock-tx-hash' }));
const mockGenerateClaimLink = mock(() => Promise.resolve('https://claim.example.com/token123'));

mock.module('../lib/cloak', () => ({
  CloakSDK: class MockCloakSDK {
    constructor(_config: any) {}
    transfer = mockTransfer;
  },
}));

mock.module('../lib/claimLink', () => ({
  generateClaimLink: mockGenerateClaimLink,
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppStateProvider>{children}</AppStateProvider>
);

// Helper to create a test wrapper with initial state using the real reducer
function createTestWrapper(initialState?: Partial<AppState>) {
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = React.useReducer(appReducer, {
      wallet: null,
      balance: { publicUsdc: 0, shieldedUsdc: 0 },
      recipients: [],
      disbursement: {
        status: 'idle',
        progress: 0,
        total: 0,
        claimLinks: [],
      },
      audit: {
        viewingKeys: [],
      },
      ui: {
        currentStep: 1,
        isLoading: false,
        error: null,
      },
      ...initialState,
    });
    return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
  };
}

function renderWithState(initialState?: Partial<AppState>) {
  const Wrapper = createTestWrapper(initialState);
  const dispatchMock = mock(() => {});
  
  // Wrap to capture dispatch calls
  const CaptureWrapper = ({ children }: { children: React.ReactNode }) => {
    const context = React.useContext(AppContext);
    // Override dispatch to capture calls
    const capturedDispatch = React.useCallback((action: any) => {
      dispatchMock(action);
      context.dispatch(action);
    }, [context.dispatch]);
    
    return (
      <AppContext.Provider value={{ state: context.state, dispatch: capturedDispatch }}>
        {children}
      </AppContext.Provider>
    );
  };
  
  const FinalWrapper = ({ children }: { children: React.ReactNode }) => (
    <Wrapper>
      <CaptureWrapper>{children}</CaptureWrapper>
    </Wrapper>
  );

  return { ...render(<DisburseForm />, { wrapper: FinalWrapper }), dispatch: dispatchMock };
}

describe('DisburseForm', () => {
  beforeEach(() => {
    mockWalletState = {
      connected: true,
      publicKey: MOCK_PUBLIC_KEY,
      signTransaction: async (tx: any) => tx,
    };
    // Reset mock to default success behavior
    mockTransfer.mockImplementation(() => Promise.resolve({ txHash: 'mock-tx-hash' }));
    mockGenerateClaimLink.mockClear();
  });

  it('renders "No recipients yet" when recipients array is empty', () => {
    const { getByTestId } = renderWithState({ recipients: [] });
    expect(getByTestId('no-recipients').textContent).toBe('No recipients yet');
  });

  it('renders recipient list when recipients exist', () => {
    const recipients: Recipient[] = [
      { address: 'ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ', amount: 100 },
      { address: 'XYZ987WVU654TSR321QPO098NML765KJI432HGF109EDC876ZBA', amount: 200 },
    ];
    const { getByTestId, getByText } = renderWithState({ recipients });

    expect(getByTestId('recipient-list')).toBeTruthy();
    expect(getByText('2 recipients')).toBeTruthy();
    expect(getByText('100.00 USDC')).toBeTruthy();
    expect(getByText('200.00 USDC')).toBeTruthy();
  });

  it('disables disburse button when no recipients', () => {
    const { getByTestId } = renderWithState({ recipients: [] });
    const button = getByTestId('disburse-button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('disables disburse button when wallet not connected', () => {
    mockWalletState = {
      connected: false,
      publicKey: null,
      signTransaction: null,
    };

    const recipients: Recipient[] = [
      { address: 'ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ', amount: 100 },
    ];
    const { getByTestId } = renderWithState({ recipients });

    const button = getByTestId('disburse-button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('clicking disburse shows progress', async () => {
    const recipients: Recipient[] = [
      { address: 'ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ', amount: 100 },
      { address: 'XYZ987WVU654TSR321QPO098NML765KJI432HGF109EDC876ZBA', amount: 200 },
    ];

    const { dispatch, getByTestId } = renderWithState({ recipients });

    const button = getByTestId('disburse-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_DISBURSEMENT_STATUS',
        payload: 'disbursing',
      });
    });
  });

  it('successful disburse generates claim links', async () => {
    const recipients: Recipient[] = [
      { address: 'ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ', amount: 100 },
    ];

    const { dispatch, getByTestId } = renderWithState({ recipients });

    const button = getByTestId('disburse-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockTransfer).toHaveBeenCalledWith({
        to: recipients[0].address,
        amount: recipients[0].amount,
      });
    });

    await waitFor(() => {
      expect(mockGenerateClaimLink).toHaveBeenCalledWith({
        commitment: 'mock-tx-hash',
        note: recipients[0].address,
        amount: recipients[0].amount,
        recipient: recipients[0].address,
      });
    });

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({
        type: 'ADD_CLAIM_LINK',
        payload: expect.objectContaining({
          recipient: expect.stringContaining('...'),
          amount: 100,
          token: 'USDC',
          url: 'https://claim.example.com/token123',
          status: 'pending',
        }),
      });
    });
  });

  it('error state shows retry/skip buttons', async () => {
    mockTransfer.mockImplementation(() => Promise.reject(new Error('Network error')));

    const recipients: Recipient[] = [
      { address: 'ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ', amount: 100 },
    ];

    const { getByTestId, getByText, container } = renderWithState({ recipients });

    const button = getByTestId('disburse-button');
    fireEvent.click(button);

    // Wait for the async error state to be set
    await waitFor(() => {
      const errorSection = container.querySelector('[data-testid="error-section"]');
      expect(errorSection).toBeTruthy();
    }, { timeout: 3000 });

    expect(getByText('Error: Network error')).toBeTruthy();
    expect(getByTestId('retry-button')).toBeTruthy();
    expect(getByTestId('skip-button')).toBeTruthy();
  });

  it('retry re-attempts failed recipient', async () => {
    mockTransfer
      .mockImplementationOnce(() => Promise.reject(new Error('Network error')))
      .mockImplementation(() => Promise.resolve({ txHash: 'mock-tx-hash' }));

    const recipients: Recipient[] = [
      { address: 'ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ', amount: 100 },
      { address: 'XYZ987WVU654TSR321QPO098NML765KJI432HGF109EDC876ZBA', amount: 200 },
    ];

    const { getByTestId, container } = renderWithState({ recipients });

    // Click disburse to trigger error
    const disburseButton = getByTestId('disburse-button');
    fireEvent.click(disburseButton);

    // Wait for the async error state to be set
    await waitFor(() => {
      const retryButton = container.querySelector('[data-testid="retry-button"]');
      expect(retryButton).toBeTruthy();
    }, { timeout: 3000 });

    fireEvent.click(getByTestId('retry-button'));

    await waitFor(() => {
      expect(mockTransfer).toHaveBeenCalledWith({
        to: recipients[0].address,
        amount: recipients[0].amount,
      });
    });

    // Should be called at least twice (first failure + retry)
    expect(mockTransfer.mock.calls.length >= 2).toBe(true);
  });

  it('skip moves to next recipient', async () => {
    mockTransfer
      .mockImplementationOnce(() => Promise.reject(new Error('Network error')))
      .mockImplementation(() => Promise.resolve({ txHash: 'mock-tx-hash' }));

    const recipients: Recipient[] = [
      { address: 'ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ', amount: 100 },
      { address: 'XYZ987WVU654TSR321QPO098NML765KJI432HGF109EDC876ZBA', amount: 200 },
    ];

    const { getByTestId, container } = renderWithState({ recipients });

    // Click disburse to trigger error
    const disburseButton = getByTestId('disburse-button');
    fireEvent.click(disburseButton);

    // Wait for the async error state to be set
    await waitFor(() => {
      const skipButton = container.querySelector('[data-testid="skip-button"]');
      expect(skipButton).toBeTruthy();
    }, { timeout: 3000 });

    fireEvent.click(getByTestId('skip-button'));

    await waitFor(() => {
      // Should process the second recipient
      expect(mockTransfer).toHaveBeenCalledWith({
        to: recipients[1].address,
        amount: recipients[1].amount,
      });
    });

    // First call is the failed one, second call should be for recipient 2
    expect(mockTransfer.mock.calls.length >= 2).toBe(true);
    expect(mockTransfer).toHaveBeenLastCalledWith({
      to: recipients[1].address,
      amount: recipients[1].amount,
    });
  });
});
