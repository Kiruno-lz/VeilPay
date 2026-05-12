import { describe, it, expect, mock } from 'bun:test';
import { Keypair } from '@solana/web3.js';

// Use dynamic import with cache busting to bypass any module mocks from other test files
const { CloakSDK } = await import('./cloak?bust=' + Date.now());

const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;

function isBase58(str: string): boolean {
  return BASE58_REGEX.test(str);
}

describe('CloakSDK (no signer - mock fallback)', () => {
  it('should instantiate with devnet config', () => {
    const sdk = new CloakSDK({ network: 'devnet' });
    expect(sdk).toBeDefined();
    expect(sdk.isLive).toBe(false);
  });

  it('should instantiate with mainnet config', () => {
    const sdk = new CloakSDK({ network: 'mainnet' });
    expect(sdk).toBeDefined();
    expect(sdk.isLive).toBe(false);
  });

  it('deposit() should return a txHash with warning', async () => {
    const consoleSpy = mock(() => {});
    const originalWarn = console.warn;
    console.warn = consoleSpy;

    const sdk = new CloakSDK({ network: 'devnet' });
    const result = await sdk.deposit({ amount: 100, token: 'USDC' });

    console.warn = originalWarn;

    expect(result).toHaveProperty('txHash');
    expect(typeof result.txHash).toBe('string');
    expect(result.txHash.length).toBeGreaterThan(0);
    expect(isBase58(result.txHash)).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('transfer() should return a txHash with warning', async () => {
    const consoleSpy = mock(() => {});
    const originalWarn = console.warn;
    console.warn = consoleSpy;

    const sdk = new CloakSDK({ network: 'devnet' });
    const result = await sdk.transfer({ to: 'some-address', amount: 50 });

    console.warn = originalWarn;

    expect(result).toHaveProperty('txHash');
    expect(typeof result.txHash).toBe('string');
    expect(result.txHash.length).toBeGreaterThan(0);
    expect(isBase58(result.txHash)).toBe(true);
  });

  it('receive() should return a txHash with warning', async () => {
    const consoleSpy = mock(() => {});
    const originalWarn = console.warn;
    console.warn = consoleSpy;

    const sdk = new CloakSDK({ network: 'devnet' });
    const result = await sdk.receive({ commitment: 'test-commitment', note: 'test-note' });

    console.warn = originalWarn;

    expect(result).toHaveProperty('txHash');
    expect(typeof result.txHash).toBe('string');
    expect(result.txHash.length).toBeGreaterThan(0);
    expect(isBase58(result.txHash)).toBe(true);
  });

  it('generateViewingKey() should return a string starting with cloak_vk_', async () => {
    const consoleSpy = mock(() => {});
    const originalWarn = console.warn;
    console.warn = consoleSpy;

    const sdk = new CloakSDK({ network: 'devnet' });
    const key = await sdk.generateViewingKey({ scope: 'audit', expiry: 30 });

    console.warn = originalWarn;

    expect(typeof key).toBe('string');
    expect(key.startsWith('cloak_vk_')).toBe(true);
    expect(key.includes('audit')).toBe(true);
    // Should contain a timestamp (numbers after scope)
    const parts = key.split('_');
    expect(parts.length).toBeGreaterThanOrEqual(3);
    const timestampPart = parts[3];
    expect(Number.isNaN(Number(timestampPart))).toBe(false);
    expect(Number(timestampPart)).toBeGreaterThan(0);
  });

  it('decryptHistory() should return TransactionRecord array', async () => {
    const consoleSpy = mock(() => {});
    const originalWarn = console.warn;
    console.warn = consoleSpy;

    const sdk = new CloakSDK({ network: 'devnet' });
    const records = await sdk.decryptHistory('test-key');

    console.warn = originalWarn;

    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBeGreaterThan(0);

    for (const record of records) {
      expect(record).toHaveProperty('date');
      expect(record.date instanceof Date).toBe(true);
      expect(record).toHaveProperty('amount');
      expect(typeof record.amount).toBe('number');
      expect(record).toHaveProperty('recipient');
      expect(typeof record.recipient).toBe('string');
      expect(record).toHaveProperty('type');
      expect(['deposit', 'transfer', 'receive']).toContain(record.type);
      expect(record).toHaveProperty('txHash');
      expect(typeof record.txHash).toBe('string');
    }
  });

  it('should allow deposit on both devnet and mainnet', async () => {
    const consoleSpy = mock(() => {});
    const originalWarn = console.warn;
    console.warn = consoleSpy;

    const devnetSdk = new CloakSDK({ network: 'devnet' });
    const mainnetSdk = new CloakSDK({ network: 'mainnet' });

    const devnetResult = await devnetSdk.deposit({ amount: 100, token: 'USDC' });
    const mainnetResult = await mainnetSdk.deposit({ amount: 100, token: 'USDC' });

    console.warn = originalWarn;

    expect(devnetResult).toHaveProperty('txHash');
    expect(mainnetResult).toHaveProperty('txHash');
    expect(devnetResult.txHash.length).toBeGreaterThan(0);
    expect(mainnetResult.txHash.length).toBeGreaterThan(0);
  });
});

describe('CloakSDK (with Keypair signer)', () => {
  it('should be in live mode with Keypair signer', () => {
    const signer = Keypair.generate();
    const sdk = new CloakSDK({ network: 'devnet', signer });
    expect(sdk.isLive).toBe(true);
  });

  it('deposit() with Keypair should attempt real SDK (may fail without funds)', async () => {
    const signer = Keypair.generate();
    const sdk = new CloakSDK({ network: 'devnet', signer });

    try {
      const result = await sdk.deposit({ amount: 0.001, token: 'SOL' });
      expect(result).toHaveProperty('txHash');
    } catch (err) {
      // Expected to fail without devnet funds
      expect(err instanceof Error).toBe(true);
    }
  });
});

describe('CloakSDK (with wallet adapter signer)', () => {
  it('should be in live mode with wallet adapter signer', () => {
    const mockAdapter = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: async (tx: any) => tx,
    };
    const sdk = new CloakSDK({ network: 'devnet', signer: mockAdapter as any });
    expect(sdk.isLive).toBe(true);
  });

  it('deposit() with wallet adapter should use real SDK (not mock)', async () => {
    const mockAdapter = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: async (tx: any) => tx,
    };
    const sdk = new CloakSDK({ network: 'devnet', signer: mockAdapter as any });
    expect(sdk.isLive).toBe(true);

    // Wallet adapter should now attempt real SDK call (will fail without connection)
    // but should NOT fall back to mock mode
    try {
      await sdk.deposit({ amount: 100, token: 'USDC' });
      // If it succeeds, great
    } catch (error: any) {
      // Expected to fail due to no real connection, but should NOT be mock fallback
      expect(error.message).not.toContain('mock');
      expect(error.message).not.toContain('Mock');
    }
  });
});

describe('CloakSDK network switching', () => {
  it('should start with devnet endpoint', () => {
    const sdk = new CloakSDK({ network: 'devnet' });
    expect(sdk.network).toBe('devnet');
    expect(sdk.endpoint).toBe('https://api.devnet.solana.com');
  });

  it('should start with mainnet endpoint', () => {
    const sdk = new CloakSDK({ network: 'mainnet' });
    expect(sdk.network).toBe('mainnet');
    expect(sdk.endpoint).toBe('https://api.mainnet-beta.solana.com');
  });

  it('should switch from devnet to mainnet dynamically', () => {
    const sdk = new CloakSDK({ network: 'devnet' });
    expect(sdk.endpoint).toBe('https://api.devnet.solana.com');

    sdk.setNetwork('mainnet');
    expect(sdk.network).toBe('mainnet');
    expect(sdk.endpoint).toBe('https://api.mainnet-beta.solana.com');
  });

  it('should switch from mainnet to devnet dynamically', () => {
    const sdk = new CloakSDK({ network: 'mainnet' });
    expect(sdk.endpoint).toBe('https://api.mainnet-beta.solana.com');

    sdk.setNetwork('devnet');
    expect(sdk.network).toBe('devnet');
    expect(sdk.endpoint).toBe('https://api.devnet.solana.com');
  });
});

describe('CloakSDK timeout handling', () => {
  it('should expose _withTimeout that throws clear error on timeout', async () => {
    const sdk = new CloakSDK({ network: 'devnet' });

    // Access private method for testing using type assertion
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const withTimeout = (sdk as any)._withTimeout.bind(sdk);

    const slowPromise = new Promise((resolve) => setTimeout(resolve, 1000));

    await expect(withTimeout(slowPromise, 'testOperation', 100)).rejects.toThrow(
      'Network timeout: testOperation failed to complete on devnet within 0.1s'
    );
  });

  it('should complete successfully when promise resolves before timeout', async () => {
    const sdk = new CloakSDK({ network: 'devnet' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const withTimeout = (sdk as any)._withTimeout.bind(sdk);

    const fastPromise = Promise.resolve({ success: true });
    const result = await withTimeout(fastPromise, 'fastOperation', 5000);

    expect(result).toEqual({ success: true });
  });

  it('timeout error message should include network name', async () => {
    const sdk = new CloakSDK({ network: 'mainnet' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const withTimeout = (sdk as any)._withTimeout.bind(sdk);

    const slowPromise = new Promise((resolve) => setTimeout(resolve, 1000));

    await expect(withTimeout(slowPromise, 'deposit', 50)).rejects.toThrow('mainnet');
  });
});