import { describe, it, expect } from 'bun:test';
import { parsePayrollCSV } from './csvParser';

describe('parsePayrollCSV', () => {
  it('should parse valid CSV with address,amount header', () => {
    const csv = `address,amount
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,1500.00
Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB,2500.50`;

    const result = parsePayrollCSV(csv);

    expect(result.recipients).toHaveLength(2);
    expect(result.recipients[0]).toEqual({
      address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      amount: 1500_000_000,
    });
    expect(result.recipients[1]).toEqual({
      address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      amount: 2500_500_000,
    });
  });

  it('should convert amount string to USDC decimals (6)', () => {
    const csv = `address,amount
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,1.5
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,0.000001`;

    const result = parsePayrollCSV(csv);

    expect(result.recipients[0].amount).toBe(1_500_000);
    expect(result.recipients[1].amount).toBe(1);
  });

  it('should calculate total amount accurately', () => {
    const csv = `address,amount
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,100.00
Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB,200.00`;

    const result = parsePayrollCSV(csv);

    expect(result.total).toBe(300_000_000);
  });

  it('should return error for non-base58 address', () => {
    const csv = `address,amount
invalid-address-with-O-and-0,100.00`;

    const result = parsePayrollCSV(csv);

    expect(result.recipients).toHaveLength(0);
    expect(result.errors[0]).toBe('Invalid Solana address: invalid-address-with-O-and-0');
  });

  it('should return error for address with invalid length (too short)', () => {
    const csv = `address,amount
short,100.00`;

    const result = parsePayrollCSV(csv);

    expect(result.recipients).toHaveLength(0);
    expect(result.errors[0]).toBe('Invalid Solana address: short');
  });

  it('should return error for address with invalid length (too long)', () => {
    const csv = `address,amount
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsUextra,100.00`;

    const result = parsePayrollCSV(csv);

    expect(result.recipients).toHaveLength(0);
    expect(result.errors[0]).toContain('Invalid Solana address');
  });

  it('should handle empty lines gracefully', () => {
    const csv = `address,amount

7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,100.00

`;

    const result = parsePayrollCSV(csv);

    expect(result.recipients).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });

  it('should return friendly message for empty file', () => {
    const csv = '';

    const result = parsePayrollCSV(csv);

    expect(result.recipients).toHaveLength(0);
    expect(result.errors[0]).toContain('empty');
  });

  it('should return friendly message for missing header', () => {
    const csv = `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,100.00`;

    const result = parsePayrollCSV(csv);

    expect(result.recipients).toHaveLength(0);
    expect(result.errors[0]).toContain('header');
  });

  it('should handle addresses at boundary lengths (32 and 44 chars)', () => {
    const addr32 = '1'.repeat(32);
    const addr44 = '1'.repeat(44);
    const csv = `address,amount\n${addr32},1.00\n${addr44},2.00`;

    const result = parsePayrollCSV(csv);

    expect(result.recipients).toHaveLength(2);
    expect(result.recipients[0].address).toBe(addr32);
    expect(result.recipients[1].address).toBe(addr44);
  });

  it('should collect errors for invalid rows without stopping', () => {
    const csv = `address,amount
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,100.00
bad-addr,200.00
Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB,300.00`;

    const result = parsePayrollCSV(csv);

    expect(result.recipients).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Invalid Solana address: bad-addr');
    expect(result.total).toBe(400_000_000);
  });
});
