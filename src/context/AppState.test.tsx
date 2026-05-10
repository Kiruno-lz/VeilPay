import React from 'react';
import { describe, it, expect } from 'bun:test';
import { render, act } from '@testing-library/react';
import { AppStateProvider } from './AppState';
import { useAppState } from './useAppState';

function TestComponent() {
  const { state, dispatch } = useAppState();
  return (
    <div>
      <div data-testid="wallet">{state.wallet === null ? 'null' : JSON.stringify(state.wallet)}</div>
      <div data-testid="publicUsdc">{state.balance.publicUsdc}</div>
      <div data-testid="shieldedUsdc">{state.balance.shieldedUsdc}</div>
      <div data-testid="recipients">{state.recipients.length}</div>
      <div data-testid="disbursementStatus">{state.disbursement.status}</div>
      <div data-testid="disbursementProgress">{state.disbursement.progress}</div>
      <div data-testid="claimLinks">{state.disbursement.claimLinks.length}</div>
      <div data-testid="viewingKeys">{state.audit.viewingKeys.length}</div>
      <div data-testid="currentStep">{state.ui.currentStep}</div>
      <div data-testid="isLoading">{state.ui.isLoading ? 'true' : 'false'}</div>
      <div data-testid="error">{state.ui.error === null ? 'null' : state.ui.error}</div>
      <div data-testid="dispatch">{typeof dispatch}</div>
      <button
        data-testid="dispatchBtn"
        onClick={() => dispatch({ type: 'SET_WALLET', payload: { connected: true, publicKey: 'abc123', adapter: null } })}
      >
        Set Wallet
      </button>
    </div>
  );
}

describe('AppStateProvider', () => {
  it('should render children and provide state and dispatch', () => {
    const { getByTestId } = render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>
    );

    expect(getByTestId('dispatch').textContent).toBe('function');
  });

  it('should have correct initial state', () => {
    const { getByTestId } = render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>
    );

    expect(getByTestId('wallet').textContent).toBe('null');
    expect(getByTestId('publicUsdc').textContent).toBe('0');
    expect(getByTestId('recipients').textContent).toBe('0');
    expect(getByTestId('disbursementStatus').textContent).toBe('idle');
    expect(getByTestId('currentStep').textContent).toBe('1');
  });

  it('should handle SET_WALLET action', () => {
    const { getByTestId } = render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>
    );

    act(() => {
      getByTestId('dispatchBtn').click();
    });

    expect(getByTestId('wallet').textContent).toContain('"connected":true');
    expect(getByTestId('wallet').textContent).toContain('"publicKey":"abc123"');
  });

  it('should handle SET_BALANCE action', () => {
    function BalanceTest() {
      const { state, dispatch } = useAppState();
      return (
        <div>
          <div data-testid="pub">{state.balance.publicUsdc}</div>
          <div data-testid="shield">{state.balance.shieldedUsdc}</div>
          <button
            data-testid="btn"
            onClick={() =>
              dispatch({ type: 'SET_BALANCE', payload: { publicUsdc: 1000, shieldedUsdc: 500 } })
            }
          >
            Set
          </button>
        </div>
      );
    }

    const { getByTestId } = render(
      <AppStateProvider>
        <BalanceTest />
      </AppStateProvider>
    );

    act(() => {
      getByTestId('btn').click();
    });
    expect(getByTestId('pub').textContent).toBe('1000');
    expect(getByTestId('shield').textContent).toBe('500');
  });

  it('should handle SET_RECIPIENTS action', () => {
    function RecipientsTest() {
      const { state, dispatch } = useAppState();
      return (
        <div>
          <div data-testid="count">{state.recipients.length}</div>
          <button
            data-testid="btn"
            onClick={() =>
              dispatch({ type: 'SET_RECIPIENTS', payload: [{ address: 'addr1', amount: 100 }] })
            }
          >
            Set
          </button>
        </div>
      );
    }

    const { getByTestId } = render(
      <AppStateProvider>
        <RecipientsTest />
      </AppStateProvider>
    );

    act(() => {
      getByTestId('btn').click();
    });
    expect(getByTestId('count').textContent).toBe('1');
  });

  it('should handle SET_DISBURSEMENT_STATUS action', () => {
    function StatusTest() {
      const { state, dispatch } = useAppState();
      return (
        <div>
          <div data-testid="status">{state.disbursement.status}</div>
          <button
            data-testid="btn"
            onClick={() => dispatch({ type: 'SET_DISBURSEMENT_STATUS', payload: 'disbursing' })}
          >
            Set
          </button>
        </div>
      );
    }

    const { getByTestId } = render(
      <AppStateProvider>
        <StatusTest />
      </AppStateProvider>
    );

    act(() => {
      getByTestId('btn').click();
    });
    expect(getByTestId('status').textContent).toBe('disbursing');
  });

  it('should handle SET_DISBURSEMENT_PROGRESS action', () => {
    function ProgressTest() {
      const { state, dispatch } = useAppState();
      return (
        <div>
          <div data-testid="progress">{state.disbursement.progress}</div>
          <button
            data-testid="btn"
            onClick={() => dispatch({ type: 'SET_DISBURSEMENT_PROGRESS', payload: 5 })}
          >
            Set
          </button>
        </div>
      );
    }

    const { getByTestId } = render(
      <AppStateProvider>
        <ProgressTest />
      </AppStateProvider>
    );

    act(() => {
      getByTestId('btn').click();
    });
    expect(getByTestId('progress').textContent).toBe('5');
  });

  it('should handle ADD_CLAIM_LINK action', () => {
    function ClaimLinkTest() {
      const { state, dispatch } = useAppState();
      return (
        <div>
          <div data-testid="count">{state.disbursement.claimLinks.length}</div>
          <button
            data-testid="btn"
            onClick={() =>
              dispatch({
                type: 'ADD_CLAIM_LINK',
                payload: {
                  id: '1',
                  recipient: 'addr1',
                  amount: 100,
                  token: 'tok1',
                  url: 'http://example.com',
                  status: 'pending',
                  createdAt: new Date(),
                },
              })
            }
          >
            Add
          </button>
        </div>
      );
    }

    const { getByTestId } = render(
      <AppStateProvider>
        <ClaimLinkTest />
      </AppStateProvider>
    );

    act(() => {
      getByTestId('btn').click();
    });
    expect(getByTestId('count').textContent).toBe('1');
  });

  it('should handle ADD_VIEWING_KEY action', () => {
    function ViewingKeyTest() {
      const { state, dispatch } = useAppState();
      return (
        <div>
          <div data-testid="count">{state.audit.viewingKeys.length}</div>
          <button
            data-testid="btn"
            onClick={() =>
              dispatch({
                type: 'ADD_VIEWING_KEY',
                payload: {
                  id: '1',
                  key: 'key1',
                  scope: 'audit',
                  expiry: new Date(),
                  createdAt: new Date(),
                  status: 'active',
                },
              })
            }
          >
            Add
          </button>
        </div>
      );
    }

    const { getByTestId } = render(
      <AppStateProvider>
        <ViewingKeyTest />
      </AppStateProvider>
    );

    act(() => {
      getByTestId('btn').click();
    });
    expect(getByTestId('count').textContent).toBe('1');
  });

  it('should handle REVOKE_VIEWING_KEY action', () => {
    function RevokeTest() {
      const { state, dispatch } = useAppState();
      return (
        <div>
          <div data-testid="status">{state.audit.viewingKeys[0]?.status ?? 'none'}</div>
          <button
            data-testid="addBtn"
            onClick={() =>
              dispatch({
                type: 'ADD_VIEWING_KEY',
                payload: {
                  id: '1',
                  key: 'key1',
                  scope: 'audit',
                  expiry: new Date(),
                  createdAt: new Date(),
                  status: 'active',
                },
              })
            }
          >
            Add
          </button>
          <button
            data-testid="revokeBtn"
            onClick={() => dispatch({ type: 'REVOKE_VIEWING_KEY', payload: '1' })}
          >
            Revoke
          </button>
        </div>
      );
    }

    const { getByTestId } = render(
      <AppStateProvider>
        <RevokeTest />
      </AppStateProvider>
    );

    act(() => {
      getByTestId('addBtn').click();
    });
    expect(getByTestId('status').textContent).toBe('active');

    act(() => {
      getByTestId('revokeBtn').click();
    });
    expect(getByTestId('status').textContent).toBe('revoked');
  });

  it('should handle SET_UI_STEP action', () => {
    function StepTest() {
      const { state, dispatch } = useAppState();
      return (
        <div>
          <div data-testid="step">{state.ui.currentStep}</div>
          <button data-testid="btn" onClick={() => dispatch({ type: 'SET_UI_STEP', payload: 3 })}>
            Set
          </button>
        </div>
      );
    }

    const { getByTestId } = render(
      <AppStateProvider>
        <StepTest />
      </AppStateProvider>
    );

    act(() => {
      getByTestId('btn').click();
    });
    expect(getByTestId('step').textContent).toBe('3');
  });

  it('should handle SET_UI_LOADING action', () => {
    function LoadingTest() {
      const { state, dispatch } = useAppState();
      return (
        <div>
          <div data-testid="loading">{state.ui.isLoading ? 'true' : 'false'}</div>
          <button
            data-testid="btn"
            onClick={() => dispatch({ type: 'SET_UI_LOADING', payload: true })}
          >
            Set
          </button>
        </div>
      );
    }

    const { getByTestId } = render(
      <AppStateProvider>
        <LoadingTest />
      </AppStateProvider>
    );

    act(() => {
      getByTestId('btn').click();
    });
    expect(getByTestId('loading').textContent).toBe('true');
  });

  it('should handle SET_UI_ERROR action', () => {
    function ErrorTest() {
      const { state, dispatch } = useAppState();
      return (
        <div>
          <div data-testid="error">{state.ui.error ?? 'null'}</div>
          <button
            data-testid="btn"
            onClick={() => dispatch({ type: 'SET_UI_ERROR', payload: 'Error message' })}
          >
            Set
          </button>
        </div>
      );
    }

    const { getByTestId } = render(
      <AppStateProvider>
        <ErrorTest />
      </AppStateProvider>
    );

    act(() => {
      getByTestId('btn').click();
    });
    expect(getByTestId('error').textContent).toBe('Error message');
  });

  it('should handle RESET_STATE action', () => {
    function ResetTest() {
      const { state, dispatch } = useAppState();
      return (
        <div>
          <div data-testid="step">{state.ui.currentStep}</div>
          <div data-testid="loading">{state.ui.isLoading ? 'true' : 'false'}</div>
          <div data-testid="error">{state.ui.error ?? 'null'}</div>
          <button
            data-testid="modifyBtn"
            onClick={() => {
              dispatch({ type: 'SET_UI_STEP', payload: 3 });
              dispatch({ type: 'SET_UI_LOADING', payload: true });
              dispatch({ type: 'SET_UI_ERROR', payload: 'Some error' });
            }}
          >
            Modify
          </button>
          <button data-testid="resetBtn" onClick={() => dispatch({ type: 'RESET_STATE' })}>
            Reset
          </button>
        </div>
      );
    }

    const { getByTestId } = render(
      <AppStateProvider>
        <ResetTest />
      </AppStateProvider>
    );

    act(() => {
      getByTestId('modifyBtn').click();
    });
    expect(getByTestId('step').textContent).toBe('3');
    expect(getByTestId('loading').textContent).toBe('true');
    expect(getByTestId('error').textContent).toBe('Some error');

    act(() => {
      getByTestId('resetBtn').click();
    });
    expect(getByTestId('step').textContent).toBe('1');
    expect(getByTestId('loading').textContent).toBe('false');
    expect(getByTestId('error').textContent).toBe('null');
  });
});
