// Shared TypeScript types

// === Cloak SDK Types ===
export * from './cloak';
import type { TransactionRecord } from './cloak';

// === App State Types ===

export interface Recipient {
  address: string;    // Solana address (base58)
  amount: number;     // Amount in USDC decimals (6)
}

export interface ClaimLink {
  id: string;
  recipient: string;  // Masked address
  amount: number;
  token: string;
  url: string;        // JWT claim URL
  status: 'pending' | 'claimed' | 'expired';
  createdAt: Date;
}

export interface ViewingKey {
  id: string;
  key: string;
  scope: string;
  expiry: Date;
  createdAt: Date;
  status: 'active' | 'revoked';
}

export interface TransactionRecord {
  date: Date;
  amount: number;
  recipient: string;
  type: 'deposit' | 'transfer' | 'receive';
  txHash: string;
}

export interface AppState {
  wallet: {
    connected: boolean;
    publicKey: string | null;
    adapter: unknown | null; // Wallet adapter instance
  } | null;
  
  balance: {
    publicUsdc: number;      // Normal wallet USDC
    shieldedUsdc: number;    // Inside Cloak pool
  };
  
  recipients: Recipient[];   // From CSV parsing
  
  disbursement: {
    status: 'idle' | 'depositing' | 'disbursing' | 'completed' | 'error';
    progress: number;         // 0-N processed
    total: number;            // N total
    claimLinks: ClaimLink[];  // Generated links
  };
  
  audit: {
    viewingKeys: ViewingKey[];
    transactions: TransactionRecord[];
    decryptStatus: 'idle' | 'loading' | 'success' | 'error';
    decryptError: string | null;
  };
  
  ui: {
    currentStep: number;      // Admin page step: 1-4
    isLoading: boolean;
    error: string | null;
  };
}

// === Action Types ===

export type AppAction =
  | { type: 'SET_WALLET'; payload: AppState['wallet'] }
  | { type: 'SET_BALANCE'; payload: AppState['balance'] }
  | { type: 'SET_RECIPIENTS'; payload: Recipient[] }
  | { type: 'SET_DISBURSEMENT_STATUS'; payload: AppState['disbursement']['status'] }
  | { type: 'SET_DISBURSEMENT_PROGRESS'; payload: number }
  | { type: 'ADD_CLAIM_LINK'; payload: ClaimLink }
  | { type: 'SET_CLAIM_LINKS'; payload: ClaimLink[] }
  | { type: 'ADD_VIEWING_KEY'; payload: ViewingKey }
  | { type: 'REVOKE_VIEWING_KEY'; payload: string }
  | { type: 'SET_AUDIT_TRANSACTIONS'; payload: TransactionRecord[] }
  | { type: 'SET_DECRYPT_STATUS'; payload: AppState['audit']['decryptStatus'] }
  | { type: 'SET_DECRYPT_ERROR'; payload: string | null }
  | { type: 'SET_UI_STEP'; payload: number }
  | { type: 'SET_UI_LOADING'; payload: boolean }
  | { type: 'SET_UI_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };
