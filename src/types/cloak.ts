// VeilPay — Cloak SDK Type Definitions
//
// Bridges the planned VeilPay API with real @cloak.dev/sdk types.

import type { PublicKey, Transaction } from '@solana/web3.js';

// ── Signer Types ─────────────────────────────────────────────────────────

/** Wallet adapter-style signer (browser wallets like Phantom, Solflare) */
export interface WalletAdapterSigner {
  publicKey: PublicKey;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
}

/** Union type for all supported signer types */
export type CloakSigner = import('@solana/web3.js').Keypair | WalletAdapterSigner;

// ── Planned VeilPay API Types (preserved for backward compatibility) ────

/** Configuration for the Cloak SDK */
export interface CloakSDKConfig {
  network: string;
  relayerEndpoint?: string;
  /** Optional signer for live mode (falls back to mock when omitted) */
  signer?: CloakSigner;
}

/** Parameters for depositing tokens into the Cloak pool */
export interface DepositParams {
  amount: number;
  token: string;
}

/** Parameters for transferring tokens to a recipient */
export interface TransferParams {
  to: string;
  amount: number;
}

/** Parameters for receiving/claiming a transfer */
export interface ReceiveParams {
  commitment: string;
  note: string;
}

/** Parameters for generating a viewing key */
export interface ViewingKeyParams {
  scope: string;
  expiry: number;
}

/** A single transaction record returned by decryptHistory */
export interface TransactionRecord {
  date: Date;
  amount: number;
  recipient: string;
  type: 'deposit' | 'transfer' | 'receive';
  txHash: string;
}

// ── Real SDK Re-exports ─────────────────────────────────────────────────

export type {
  CloakKeyPair,
  MasterKey,
  SpendKey,
  ViewKey,
  Utxo,
  UtxoKeypair,
  TransactParams,
  TransactOptions,
  TransactResult,
  ScanOptions,
  ScanResult,
  ScannedTransaction,
  ScanSummary,
  ComplianceReport,
  ViewingKeyPair,
} from '@cloak.dev/sdk';

// ── VeilPay Domain Types ────────────────────────────────────────────────

/** Supported token symbols for payroll */
export type PayrollToken = 'USDC' | 'STRK' | 'ETH';

/** Maps VeilPay tokens to SDK token identifiers */
export const TOKEN_MAP: Record<PayrollToken, string> = {
  USDC: 'USDC',
  STRK: 'STRK',
  ETH: 'ETH',
};

/** Employee record in VeilPay */
export interface Employee {
  id: string;
  name: string;
  walletAddress: string;
  token: PayrollToken;
  amount: string; // display amount (e.g., "1000.00")
}

/** Single payroll transaction record */
export interface PayrollTransaction {
  id: string;
  employeeId: string;
  employeeName: string;
  token: PayrollToken;
  amountDisplay: string;
  amountWei: bigint;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Batch payroll run */
export interface PayrollBatch {
  id: string;
  name: string;
  transactions: PayrollTransaction[];
  totalAmounts: Partial<Record<PayrollToken, string>>;
  status: 'draft' | 'executing' | 'completed' | 'failed';
  createdAt: Date;
  executedAt?: Date;
}

/** Cloak wallet state for the employer */
export interface EmployerWalletState {
  isInitialized: boolean;
  isDeployed: boolean;
  walletInfo: { address: string; publicKey: string } | null;
  balances: Partial<
    Record<
      PayrollToken,
      { balance: bigint; pending: bigint; nonce: bigint }
    >
  >;
}

/** Configuration for VeilPay's Cloak integration */
export interface VeilPayCloakConfig {
  network: string;
  rpcUrl?: string;
  /** Storage adapter (default: localStorage-based) */
  storage?: {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
  };
}

/** Result of a batch payroll execution */
export interface PayrollExecutionResult {
  success: PayrollTransaction[];
  failed: PayrollTransaction[];
  totalGasUsed?: bigint;
}
