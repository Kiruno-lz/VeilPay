import { useReducer } from 'react';
import type { AppState, AppAction } from '../types';
import { AppContext } from './AppContext';

const initialState: AppState = {
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
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_WALLET':
      return { ...state, wallet: action.payload };
    case 'SET_BALANCE':
      return { ...state, balance: action.payload };
    case 'SET_RECIPIENTS':
      return { ...state, recipients: action.payload };
    case 'SET_DISBURSEMENT_STATUS':
      return {
        ...state,
        disbursement: { ...state.disbursement, status: action.payload },
      };
    case 'SET_DISBURSEMENT_PROGRESS':
      return {
        ...state,
        disbursement: { ...state.disbursement, progress: action.payload },
      };
    case 'ADD_CLAIM_LINK':
      return {
        ...state,
        disbursement: {
          ...state.disbursement,
          claimLinks: [...state.disbursement.claimLinks, action.payload],
        },
      };
    case 'SET_CLAIM_LINKS':
      return {
        ...state,
        disbursement: { ...state.disbursement, claimLinks: action.payload },
      };
    case 'ADD_VIEWING_KEY':
      return {
        ...state,
        audit: {
          ...state.audit,
          viewingKeys: [...state.audit.viewingKeys, action.payload],
        },
      };
    case 'REVOKE_VIEWING_KEY':
      return {
        ...state,
        audit: {
          ...state.audit,
          viewingKeys: state.audit.viewingKeys.map((key) =>
            key.id === action.payload ? { ...key, status: 'revoked' as const } : key
          ),
        },
      };
    case 'SET_UI_STEP':
      return { ...state, ui: { ...state.ui, currentStep: action.payload } };
    case 'SET_UI_LOADING':
      return { ...state, ui: { ...state.ui, isLoading: action.payload } };
    case 'SET_UI_ERROR':
      return { ...state, ui: { ...state.ui, error: action.payload } };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}
