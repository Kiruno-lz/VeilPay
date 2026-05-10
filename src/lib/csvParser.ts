import Papa from 'papaparse';
import type { Recipient } from '../types';

export interface ParseResult {
  recipients: Recipient[];
  errors: string[];
  total: number;
}

const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;
const USDC_DECIMALS = 1_000_000;

function isValidSolanaAddress(address: string): boolean {
  if (!address || address.length < 32 || address.length > 44) {
    return false;
  }
  return BASE58_REGEX.test(address);
}

function parseAmount(amountStr: string): number {
  const parsed = parseFloat(amountStr);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error(`Invalid amount: ${amountStr}`);
  }
  return Math.round(parsed * USDC_DECIMALS);
}

export function parsePayrollCSV(csvContent: string): ParseResult {
  const recipients: Recipient[] = [];
  const errors: string[] = [];

  if (!csvContent || !csvContent.trim()) {
    return {
      recipients: [],
      errors: ['File is empty. Please upload a valid CSV file.'],
      total: 0,
    };
  }

  const parsed = Papa.parse<string[]>(csvContent, {
    skipEmptyLines: true,
  });

  if (parsed.data.length === 0) {
    return {
      recipients: [],
      errors: ['File is empty. Please upload a valid CSV file.'],
      total: 0,
    };
  }

  const headers = parsed.data[0];
  const hasHeader =
    headers.length >= 2 &&
    headers[0]?.toLowerCase().trim() === 'address' &&
    headers[1]?.toLowerCase().trim() === 'amount';

  if (!hasHeader) {
    return {
      recipients: [],
      errors: ['Missing required header: "address,amount". Please upload a valid CSV file.'],
      total: 0,
    };
  }

  const rows = parsed.data.slice(1);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    if (!row || row.length < 2) {
      continue;
    }

    const address = row[0]?.trim();
    const amountStr = row[1]?.trim();

    if (!address && !amountStr) {
      continue;
    }

    if (!isValidSolanaAddress(address)) {
      errors.push(`Invalid Solana address: ${address}`);
      continue;
    }

    try {
      const amount = parseAmount(amountStr);
      recipients.push({ address, amount });
    } catch {
      errors.push(`Invalid amount: ${amountStr}`);
    }
  }

  const total = recipients.reduce((sum, r) => sum + r.amount, 0);

  return { recipients, errors, total };
}
