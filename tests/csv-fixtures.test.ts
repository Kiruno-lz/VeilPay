import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parsePayrollCSV } from '../src/lib/csvParser';

const FIXTURES_DIR = join(import.meta.dir, 'fixtures');

function readFixture(filename: string): string {
  return readFileSync(join(FIXTURES_DIR, filename), 'utf-8');
}

describe('CSV Fixture Tests', () => {
  describe('valid cases', () => {
    it('csv-valid-basic.csv: should parse 3 recipients with 0 errors', () => {
      const csv = readFixture('csv-valid-basic.csv');
      const result = parsePayrollCSV(csv);

      expect(result.recipients).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
      expect(result.total).toBeGreaterThan(0);

      // Verify addresses
      expect(result.recipients[0].address).toBe('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
      expect(result.recipients[1].address).toBe('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
      expect(result.recipients[2].address).toBe('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

      // Verify amounts (USDC decimals: 6)
      expect(result.recipients[0].amount).toBe(1_500_000);
      expect(result.recipients[1].amount).toBe(750_000);
      expect(result.recipients[2].amount).toBe(100_000_000);
    });

    it('csv-valid-boundary.csv: should parse 4 recipients (skip empty lines) with 0 errors', () => {
      const csv = readFixture('csv-valid-boundary.csv');
      const result = parsePayrollCSV(csv);

      expect(result.recipients).toHaveLength(4);
      expect(result.errors).toHaveLength(0);

      // Verify boundary addresses
      expect(result.recipients[0].address).toBe('1'.repeat(32));
      expect(result.recipients[1].address).toBe('1'.repeat(44));
      expect(result.recipients[2].address).toBe('So11111111111111111111111111111111111111112');
      expect(result.recipients[3].address).toBe('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
    });
  });

  describe('invalid cases', () => {
    it('csv-invalid-header.csv: should return header error with 0 recipients', () => {
      const csv = readFixture('csv-invalid-header.csv');
      const result = parsePayrollCSV(csv);

      expect(result.recipients).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('header');
    });

    it('csv-invalid-address.csv: should collect address errors but parse last valid row', () => {
      const csv = readFixture('csv-invalid-address.csv');
      const result = parsePayrollCSV(csv);

      // Should have exactly 1 valid recipient (the last row)
      expect(result.recipients).toHaveLength(1);
      expect(result.recipients[0].address).toBe('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
      expect(result.recipients[0].amount).toBe(1_000_000);

      // Should have collected address errors
      expect(result.errors.length).toBeGreaterThan(0);

      // Verify specific error types
      const addressErrors = result.errors.filter(e => e.includes('Invalid Solana address'));
      expect(addressErrors.length).toBeGreaterThan(0);
    });

    it('csv-invalid-amount.csv: should collect amount errors', () => {
      const csv = readFixture('csv-invalid-amount.csv');
      const result = parsePayrollCSV(csv);

      // Check for amount-related errors
      const amountErrors = result.errors.filter(e => e.includes('Invalid amount'));
      expect(amountErrors.length).toBeGreaterThan(0);

      // Zero amount should be parsed successfully (0 >= 0)
      const zeroAmountRecipient = result.recipients.find(
        r => r.address === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
      );
      expect(zeroAmountRecipient).toBeDefined();
      expect(zeroAmountRecipient!.amount).toBe(0);
    });

    it('csv-empty.csv: should return empty data with 0 errors', () => {
      const csv = readFixture('csv-empty.csv');
      const result = parsePayrollCSV(csv);

      expect(result.recipients).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('mixed case', () => {
    it('csv-mixed.csv: should have both valid recipients and collected errors', () => {
      const csv = readFixture('csv-mixed.csv');
      const result = parsePayrollCSV(csv);

      // Should have some valid recipients
      expect(result.recipients.length).toBeGreaterThan(0);

      // Should have some errors
      expect(result.errors.length).toBeGreaterThan(0);

      // Verify specific valid recipients exist
      const validAddresses = [
        '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        '1'.repeat(32),
        '1'.repeat(44),
      ];

      for (const addr of validAddresses) {
        const found = result.recipients.find(r => r.address === addr);
        expect(found).toBeDefined();
      }
    });
  });
});
