import { describe, it, expect } from 'bun:test';
import { CloakSDK } from './cloak';

const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;

function isBase58(str: string): boolean {
  return BASE58_REGEX.test(str);
}

describe('CloakSDK (mock mode)', () => {
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

  it('deposit() should return a 44-char base58 txHash', async () => {
    const sdk = new CloakSDK({ network: 'devnet' });
    const result = await sdk.deposit({ amount: 100, token: 'USDC' });
    expect(result).toHaveProperty('txHash');
    expect(typeof result.txHash).toBe('string');
    expect(result.txHash.length).toBe(44);
    expect(isBase58(result.txHash)).toBe(true);
  });

  it('transfer() should return a txHash without throwing', async () => {
    const sdk = new CloakSDK({ network: 'devnet' });
    const result = await sdk.transfer({ to: 'some-address', amount: 50 });
    expect(result).toHaveProperty('txHash');
    expect(typeof result.txHash).toBe('string');
    expect(result.txHash.length).toBe(44);
    expect(isBase58(result.txHash)).toBe(true);
  });

  it('receive() should return a txHash without throwing', async () => {
    const sdk = new CloakSDK({ network: 'devnet' });
    const result = await sdk.receive({ commitment: 'test-commitment', note: 'test-note' });
    expect(result).toHaveProperty('txHash');
    expect(typeof result.txHash).toBe('string');
    expect(result.txHash.length).toBe(44);
    expect(isBase58(result.txHash)).toBe(true);
  });

  it('generateViewingKey() should return a string starting with cloak_vk_', async () => {
    const sdk = new CloakSDK({ network: 'devnet' });
    const key = await sdk.generateViewingKey({ scope: 'audit', expiry: 30 });
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
    const sdk = new CloakSDK({ network: 'devnet' });
    const records = await sdk.decryptHistory('test-key');
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
    const devnetSdk = new CloakSDK({ network: 'devnet' });
    const mainnetSdk = new CloakSDK({ network: 'mainnet' });

    const devnetResult = await devnetSdk.deposit({ amount: 100, token: 'USDC' });
    const mainnetResult = await mainnetSdk.deposit({ amount: 100, token: 'USDC' });

    expect(devnetResult).toHaveProperty('txHash');
    expect(mainnetResult).toHaveProperty('txHash');
    expect(devnetResult.txHash.length).toBe(44);
    expect(mainnetResult.txHash.length).toBe(44);
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
    
    await expect(withTimeout(slowPromise, 'deposit', 50)).rejects.toThrow(
      'mainnet'
    );
  });
});
