import '../happy-dom-setup';
import { describe, it, expect, mock } from 'bun:test';
import { render, act, waitFor } from '@testing-library/react';
import AuditPage from './AuditPage';
import { AppStateProvider } from '../context/AppState';
import { useAppState } from '../context/useAppState';

// Mock CloakSDK to avoid network calls and control behavior
const mockDecryptHistory = mock(() => Promise.resolve([]));

mock.module('../lib/cloak', () => ({
  CloakSDK: class MockCloakSDK {
    constructor(_config: { network: string }) {}
    decryptHistory = mockDecryptHistory;
  },
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <AppStateProvider>{children}</AppStateProvider>;
}

describe('AuditPage', () => {
  it('should render with data-testid="audit-page"', () => {
    const { getByTestId } = render(<AuditPage />, { wrapper: Wrapper });
    expect(getByTestId('audit-page')).toBeTruthy();
  });

  it('should render key-input textarea', () => {
    const { getByTestId } = render(<AuditPage />, { wrapper: Wrapper });
    expect(getByTestId('key-input')).toBeTruthy();
  });

  it('should render decrypt-button', () => {
    const { getByTestId } = render(<AuditPage />, { wrapper: Wrapper });
    expect(getByTestId('decrypt-button')).toBeTruthy();
  });

  it('should show "Enter viewing key to see history" when key is empty', () => {
    const { getByText } = render(<AuditPage />, { wrapper: Wrapper });
    expect(getByText(/Enter viewing key to see history/)).toBeTruthy();
  });

  it('should render export-button', () => {
    const { getByTestId } = render(<AuditPage />, { wrapper: Wrapper });
    expect(getByTestId('export-button')).toBeTruthy();
  });

  it('should disable decrypt button when key is empty', () => {
    const { getByTestId } = render(<AuditPage />, { wrapper: Wrapper });
    const btn = getByTestId('decrypt-button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('should show loading state when decryptStatus is loading', () => {
    function TestComponent() {
      const { dispatch } = useAppState();
      return (
        <div>
          <AuditPage />
          <button
            data-testid="trigger-loading"
            onClick={() => {
              dispatch({ type: 'SET_DECRYPT_STATUS', payload: 'loading' });
            }}
          >
            Trigger Loading
          </button>
        </div>
      );
    }

    const { getByTestId, queryByTestId } = render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );

    act(() => {
      getByTestId('trigger-loading').click();
    });

    expect(queryByTestId('decrypt-loading')).toBeTruthy();
  });

  it('should show transaction table when transactions are set', () => {
    function TestComponent() {
      const { dispatch } = useAppState();
      return (
        <div>
          <AuditPage />
          <button
            data-testid="trigger-success"
            onClick={() => {
              dispatch({
                type: 'SET_AUDIT_TRANSACTIONS',
                payload: [
                  {
                    date: new Date('2024-01-01'),
                    amount: 1000,
                    recipient: '0xabc',
                    type: 'deposit',
                    txHash: 'tx123',
                  },
                ],
              });
              dispatch({ type: 'SET_DECRYPT_STATUS', payload: 'success' });
            }}
          >
            Trigger Success
          </button>
        </div>
      );
    }

    const { getByTestId, queryByTestId } = render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );

    act(() => {
      getByTestId('trigger-success').click();
    });

    expect(queryByTestId('transaction-table')).toBeTruthy();
    expect(getByTestId('transaction-count')).toBeTruthy();
  });

  it('should show error state when decryptError is set', () => {
    function TestComponent() {
      const { dispatch } = useAppState();
      return (
        <div>
          <AuditPage />
          <button
            data-testid="trigger-error"
            onClick={() => {
              dispatch({ type: 'SET_DECRYPT_ERROR', payload: 'Invalid or expired viewing key' });
              dispatch({ type: 'SET_DECRYPT_STATUS', payload: 'error' });
            }}
          >
            Trigger Error
          </button>
        </div>
      );
    }

    const { getByTestId, queryByTestId } = render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );

    act(() => {
      getByTestId('trigger-error').click();
    });

    expect(queryByTestId('transaction-error-state')).toBeTruthy();
  });

  it('should enable export button when transactions exist', () => {
    function TestComponent() {
      const { dispatch } = useAppState();
      return (
        <div>
          <AuditPage />
          <button
            data-testid="trigger-success"
            onClick={() => {
              dispatch({
                type: 'SET_AUDIT_TRANSACTIONS',
                payload: [
                  {
                    date: new Date('2024-01-01'),
                    amount: 1000,
                    recipient: '0xabc',
                    type: 'deposit',
                    txHash: 'tx123',
                  },
                ],
              });
              dispatch({ type: 'SET_DECRYPT_STATUS', payload: 'success' });
            }}
          >
            Trigger Success
          </button>
        </div>
      );
    }

    const { getByTestId } = render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );

    act(() => {
      getByTestId('trigger-success').click();
    });

    const exporterBtn = getByTestId('audit-exporter-button') as HTMLButtonElement;
    expect(exporterBtn.disabled).toBe(false);
  });

  it('should dispatch correct actions on successful decrypt', async () => {
    mockDecryptHistory.mockClear();
    mockDecryptHistory.mockReturnValueOnce(Promise.resolve([
      {
        date: new Date('2024-01-01'),
        amount: 1000,
        recipient: '0xabc',
        type: 'deposit' as const,
        txHash: 'tx123',
      },
    ]));

    function TestComponent() {
      const { state, dispatch } = useAppState();
      return (
        <div>
          <AuditPage />
          <button
            data-testid="trigger-decrypt"
            onClick={async () => {
              dispatch({ type: 'SET_DECRYPT_STATUS', payload: 'loading' });
              try {
                const { CloakSDK } = await import('../lib/cloak');
                const sdk = new CloakSDK({ network: 'devnet' });
                const records = await sdk.decryptHistory('test-key');
                dispatch({ type: 'SET_AUDIT_TRANSACTIONS', payload: records });
                dispatch({ type: 'SET_DECRYPT_STATUS', payload: 'success' });
              } catch {
                dispatch({ type: 'SET_DECRYPT_ERROR', payload: 'Invalid or expired viewing key' });
                dispatch({ type: 'SET_DECRYPT_STATUS', payload: 'error' });
              }
            }}
          >
            Trigger Decrypt
          </button>
          <div data-testid="status">{state.audit.decryptStatus}</div>
          <div data-testid="tx-count">{state.audit.transactions.length}</div>
        </div>
      );
    }

    const { getByTestId } = render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );

    act(() => {
      getByTestId('trigger-decrypt').click();
    });

    await waitFor(() => {
      expect(getByTestId('status').textContent).toBe('success');
    }, { timeout: 3000 });

    expect(getByTestId('tx-count').textContent).toBe('1');
    expect(mockDecryptHistory).toHaveBeenCalledWith('test-key');
  });
});
