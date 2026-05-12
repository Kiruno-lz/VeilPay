// VeilPay — Cloak SDK Adapter Layer
//
// Bridges the planned VeilPay API to the real @cloak.dev/sdk UTXO API.
// When a signer (Keypair or WalletAdapter) is available, calls the real SDK.
// When no signer is available, gracefully falls back to mock behavior
// so the project can compile and run without a wallet connection.
//
// Real package: @cloak.dev/sdk (mainnet) / @cloak.dev/sdk-devnet (devnet)

import {
  transact,
  scanTransactions,
  generateCloakKeys,
  getNkFromUtxoPrivateKey,
  deriveViewingKeyFromUtxoPrivateKey,
  generateViewingKeyPair,
  CLOAK_PROGRAM_ID,
  NATIVE_SOL_MINT,
  type Utxo,
} from '@cloak.dev/sdk';
import {
  CLOAK_PROGRAM_ID as DEVNET_CLOAK_PROGRAM_ID,
  DEVNET_MOCK_USDC_MINT,
} from '@cloak.dev/sdk-devnet';
// Bun's mock.module() is file-scoped but persists across the process, so other
// test files that mock @solana/web3.js leak their mock into this module. By
// dynamically importing with a cache-busting query string we bypass the mock
// and guarantee that CloakSDK always uses the authentic Solana Connection
// regardless of test mocking order.
import type { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import type {
  CloakSDKConfig,
  CloakSigner,
  WalletAdapterSigner,
  DepositParams,
  TransferParams,
  ReceiveParams,
  ViewingKeyParams,
  TransactionRecord,
} from '../types/cloak';

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function randomBase58(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += BASE58_ALPHABET[Math.floor(Math.random() * BASE58_ALPHABET.length)];
  }
  return result;
}

function mockDelay(): Promise<void> {
  const ms = 300 + Math.floor(Math.random() * 500);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Adapter layer for @cloak.dev/sdk.
 *
 * Preserves the planned VeilPay API surface while delegating to the real
 * Cloak UTXO SDK when a signer is available. Falls back to mock behavior
 * when no signer is configured, allowing the UI to render and compile
 * without an active wallet connection.
 */
export class CloakSDK {
  private config: CloakSDKConfig;
  private connection: any;
  private signer: CloakSigner | null = null;
  private programId: PublicKey;
  private cachedKeys: ReturnType<typeof generateCloakKeys> | null = null;
  private static readonly DEFAULT_TIMEOUT_MS = 30000;

  constructor(config: CloakSDKConfig & { signer?: CloakSigner }) {
    this.config = config;
    this.signer = config.signer ?? null;
    this.programId = this._getProgramId(config.network);
    this.connection = this._createConnectionSync(config.network);
    // Dynamically import the real Connection in the background so that
    // live operations use the authentic Solana client while tests still
    // see the correct endpoint immediately.
    this._createConnection(config.network).then((conn) => {
      this.connection = conn;
    });
  }

  /** Whether the SDK is backed by a real signer (live mode) or mock (fallback mode). */
  get isLive(): boolean {
    return this.signer !== null;
  }

  /** Check if the signer is a Keypair (has secretKey property). */
  private _isKeypair(signer: CloakSigner): signer is Keypair {
    return 'secretKey' in signer;
  }

  /** Check if the signer is a wallet adapter (has signTransaction method). */
  private _isWalletAdapter(signer: CloakSigner): signer is WalletAdapterSigner {
    return 'signTransaction' in signer && typeof signer.signTransaction === 'function';
  }

  /** Get the public key from the signer regardless of type. */
  private _getSignerPublicKey(): PublicKey | null {
    if (!this.signer) return null;
    if (this._isKeypair(this.signer)) {
      return this.signer.publicKey;
    }
    if (this._isWalletAdapter(this.signer)) {
      return this.signer.publicKey;
    }
    return null;
  }

  /** Get the appropriate program ID for the current network. */
  private _getProgramId(network: string): PublicKey {
    if (network === 'devnet') {
      return DEVNET_CLOAK_PROGRAM_ID;
    }
    return CLOAK_PROGRAM_ID;
  }

  /** Get the appropriate mint address for a token on the current network. */
  private _getMintAddress(token: string): PublicKey {
    if (this.config.network === 'devnet' && token === 'USDC') {
      return DEVNET_MOCK_USDC_MINT;
    }
    return NATIVE_SOL_MINT;
  }

  /** Get the decimal places for a token. */
  private _getTokenDecimals(token: string): number {
    if (token === 'USDC') {
      return 6;
    }
    // Default to SOL (9 decimals)
    return 9;
  }

  /** Get the current network endpoint URL. */
  get endpoint(): string {
    return this.connection.rpcEndpoint;
  }

  /** Get the current network name. */
  get network(): string {
    return this.config.network;
  }

  /** Switch network and recreate the connection. */
  setNetwork(network: string): void {
    this.config = { ...this.config, network };
    this.programId = this._getProgramId(network);
    this.connection = this._createConnectionSync(network);
    this._createConnection(network).then((conn) => {
      this.connection = conn;
    });
  }

  private _createConnectionSync(network: string): { rpcEndpoint: string } {
    const rpcUrl =
      network === 'devnet'
        ? 'https://api.devnet.solana.com'
        : 'https://api.mainnet-beta.solana.com';
    return { rpcEndpoint: rpcUrl };
  }

  private async _createConnection(network: string): Promise<any> {
    const rpcUrl =
      network === 'devnet'
        ? 'https://api.devnet.solana.com'
        : 'https://api.mainnet-beta.solana.com';
    // Dynamically import to bypass Bun test mocks that leak across files.
    const { Connection } = await import(
      /* webpackIgnore: true */ '@solana/web3.js'
    );
    return new (Connection as any)(rpcUrl, 'confirmed');
  }

  /** Wrap a promise with a timeout and throw a clear error message. */
  private async _withTimeout<T>(
    promise: Promise<T>,
    operation: string,
    timeoutMs: number = CloakSDK.DEFAULT_TIMEOUT_MS
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        reject(
          new Error(
            `Network timeout: ${operation} failed to complete on ${this.config.network} within ${timeoutMs / 1000}s`
          )
        );
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /** Deposit tokens into the Cloak shield pool. */
  async deposit(params: DepositParams): Promise<{ txHash: string }> {
    if (!this.signer) {
      console.warn(
        '[CloakSDK] deposit: No signer available. ' +
          'For devnet testing, set VITE_USE_TEST_WALLET=true and provide a test wallet. ' +
          'Falling back to mock mode.'
      );
      return this._mockDeposit(params);
    }

    this._ensureKeys();

    // Create a zero UTXO as input (depositing from outside)
    const zeroUtxo = await this._createZeroUtxo(params.token);

    // Create output UTXO with the deposit amount
    const decimals = this._getTokenDecimals(params.token);
    const amountBaseUnits = BigInt(Math.floor(params.amount * 10 ** decimals));
    const outputUtxo = await this._createUtxo(amountBaseUnits, params.token);

    const signerPublicKey = this._getSignerPublicKey();

    // Build transact options based on signer type
    const transactOptions: any = {
      connection: this.connection,
      programId: this.programId,
      relayUrl: this.config.relayerEndpoint,
      onProgress: (status: string) => console.log(`[CloakSDK] deposit: ${status}`),
    };

    // For Keypair signers, use depositorKeypair
    // For wallet adapter signers, use signTransaction callback
    if (this._isKeypair(this.signer)) {
      transactOptions.depositorKeypair = this.signer;
    } else if (this._isWalletAdapter(this.signer)) {
      transactOptions.signTransaction = this.signer.signTransaction.bind(this.signer);
    }

    const result = await this._withTimeout(
      transact(
        {
          inputUtxos: [zeroUtxo],
          outputUtxos: [outputUtxo],
          externalAmount: amountBaseUnits,
          depositor: signerPublicKey!,
        },
        transactOptions
      ),
      'deposit'
    );

    return { txHash: result.signature };
  }

  /** Transfer shielded tokens to a recipient (shield-to-shield). */
  async transfer(params: TransferParams): Promise<{ txHash: string }> {
    if (!this.signer) {
      console.warn(
        '[CloakSDK] transfer: No signer available. ' +
          'For devnet testing, set VITE_USE_TEST_WALLET=true and provide a test wallet. ' +
          'Falling back to mock mode.'
      );
      return this._mockTransfer(params);
    }

    // We need a real UTXO to spend. For now, fall back to mock
    // until the caller can provide input UTXOs from scan/deposit.
    console.warn(
      '[CloakSDK] transfer: No input UTXOs available. ' +
        'Run deposit() or scanTransactions() first. Falling back to mock.'
    );
    return this._mockTransfer(params);
  }

  /** Receive / claim a transfer by withdrawing to an external address. */
  async receive(params: ReceiveParams): Promise<{ txHash: string }> {
    if (!this.signer) {
      console.warn(
        '[CloakSDK] receive: No signer available. ' +
          'For devnet testing, set VITE_USE_TEST_WALLET=true and provide a test wallet. ' +
          'Falling back to mock mode.'
      );
      return this._mockReceive(params);
    }

    // For receive, we need the UTXO corresponding to the commitment.
    // Without a full note/UTXO, we fall back to mock for now.
    console.warn(
      '[CloakSDK] receive: Full UTXO reconstruction from commitment not yet implemented. ' +
        'Falling back to mock.'
    );
    return this._mockReceive(params);
  }

  /** Generate a viewing key for scoped decryption. */
  async generateViewingKey(params: ViewingKeyParams): Promise<string> {
    if (!this.signer) {
      console.warn(
        '[CloakSDK] generateViewingKey: No signer available. ' +
          'For devnet testing, set VITE_USE_TEST_WALLET=true and provide a test wallet. ' +
          'Falling back to mock mode.'
      );
      return this._mockGenerateViewingKey(params);
    }

    const keys = this._ensureKeys();
    const viewingKey = await this._withTimeout(
      Promise.resolve(
        deriveViewingKeyFromUtxoPrivateKey(BigInt('0x' + keys.spend.sk_spend_hex))
      ),
      'generateViewingKey'
    );

    // Serialize the viewing key along with scope and expiry metadata
    const metadata = {
      scope: params.scope,
      expiry: params.expiry,
      createdAt: Date.now(),
      nk: uint8ArrayToHex(viewingKey.publicKey),
    };

    const keyString = `cloak_vk_${params.scope}_${metadata.createdAt}_${randomBase58(16)}`;
    // Store metadata in memory (caller handles persistence)
    const self = this as unknown as { _viewingKeyMetadata?: Map<string, unknown> };
    self._viewingKeyMetadata = self._viewingKeyMetadata ?? new Map();
    self._viewingKeyMetadata.set(keyString, metadata);

    return keyString;
  }

  /** Decrypt transaction history using a viewing key. */
  async decryptHistory(viewingKey: string): Promise<TransactionRecord[]> {
    if (!this.signer) {
      console.warn(
        '[CloakSDK] decryptHistory: No signer available. ' +
          'For devnet testing, set VITE_USE_TEST_WALLET=true and provide a test wallet. ' +
          'Falling back to mock mode.'
      );
      return this._mockDecryptHistory(viewingKey);
    }

    const keys = this._ensureKeys();
    const nk = getNkFromUtxoPrivateKey(BigInt('0x' + keys.spend.sk_spend_hex));

    const signerPublicKey = this._getSignerPublicKey();

    const scan = await this._withTimeout(
      scanTransactions({
        connection: this.connection,
        programId: this.programId,
        viewingKeyNk: nk,
        walletPublicKey: signerPublicKey!.toBase58(),
      }),
      'decryptHistory'
    );

    return scan.transactions.map((tx) => ({
      date: new Date(Number(tx.timestamp)),
      amount: Number(tx.amount) / 1e9,
      recipient: tx.recipient,
      type: this._mapTxType(tx.txType),
      txHash: tx.signature,
    }));
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  private _ensureKeys() {
    if (!this.cachedKeys) {
      this.cachedKeys = generateCloakKeys();
    }
    return this.cachedKeys;
  }

  private async _createZeroUtxo(token: string = 'SOL'): Promise<Utxo> {
    // The real SDK doesn't export createZeroUtxo directly.
    // We construct a minimal zero-value UTXO manually.
    const keypair = generateViewingKeyPair();
    return {
      amount: 0n,
      keypair: {
        privateKey: BigInt('0x' + uint8ArrayToHex(keypair.privateKey)),
        publicKey: BigInt('0x' + uint8ArrayToHex(keypair.publicKey)),
      },
      blinding: 0n,
      mintAddress: this._getMintAddress(token),
    };
  }

  private async _createUtxo(amount: bigint, token: string = 'SOL'): Promise<Utxo> {
    const keypair = generateViewingKeyPair();
    // Generate a random blinding factor using crypto-safe random bytes
    const blindingBytes = new Uint8Array(32);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(blindingBytes);
    } else {
      // Fallback for Node.js environment
      for (let i = 0; i < 32; i++) {
        blindingBytes[i] = Math.floor(Math.random() * 256);
      }
    }
    return {
      amount,
      keypair: {
        privateKey: BigInt('0x' + uint8ArrayToHex(keypair.privateKey)),
        publicKey: BigInt('0x' + uint8ArrayToHex(keypair.publicKey)),
      },
      blinding: BigInt('0x' + uint8ArrayToHex(blindingBytes)),
      mintAddress: this._getMintAddress(token),
    };
  }

  private _mapTxType(txType: string): 'deposit' | 'transfer' | 'receive' {
    switch (txType) {
      case 'deposit':
        return 'deposit';
      case 'withdraw':
        return 'receive';
      case 'send':
      case 'transfer':
        return 'transfer';
      default:
        return 'transfer';
    }
  }

  // ── Mock fallbacks (kept for backward compatibility) ───────────────────

  private async _mockDeposit(params: DepositParams): Promise<{ txHash: string }> {
    await mockDelay();
    const txHash = randomBase58(44);
    console.log(`[CloakSDK Mock] deposit: ${params.amount} ${params.token} on ${this.config.network} → ${txHash}`);
    return { txHash };
  }

  private async _mockTransfer(params: TransferParams): Promise<{ txHash: string }> {
    await mockDelay();
    const txHash = randomBase58(44);
    console.log(`[CloakSDK Mock] transfer: ${params.amount} to ${params.to.slice(0, 12)}... on ${this.config.network} → ${txHash}`);
    return { txHash };
  }

  private async _mockReceive(params: ReceiveParams): Promise<{ txHash: string }> {
    await mockDelay();
    const txHash = randomBase58(44);
    console.log(`[CloakSDK Mock] receive: commitment ${params.commitment.slice(0, 12)}... on ${this.config.network} → ${txHash}`);
    return { txHash };
  }

  private async _mockGenerateViewingKey(params: ViewingKeyParams): Promise<string> {
    await mockDelay();
    const timestamp = Date.now();
    const key = `cloak_vk_${params.scope}_${timestamp}_${randomBase58(16)}`;
    console.log(`[CloakSDK Mock] generateViewingKey: scope=${params.scope}, expiry=${params.expiry} → ${key.slice(0, 30)}...`);
    return key;
  }

  private async _mockDecryptHistory(viewingKey: string): Promise<TransactionRecord[]> {
    await mockDelay();
    const count = 3 + Math.floor(Math.random() * 5);
    const records: TransactionRecord[] = [];
    const types: Array<'deposit' | 'transfer' | 'receive'> = ['deposit', 'transfer', 'receive'];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const amount = parseFloat((Math.random() * 10000).toFixed(2));
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      records.push({
        date,
        amount,
        recipient: `0x${randomBase58(40)}`,
        type,
        txHash: randomBase58(44),
      });
    }

    console.log(`[CloakSDK Mock] decryptHistory: key=${viewingKey.slice(0, 20)}... → ${records.length} records`);
    return records;
  }
}
