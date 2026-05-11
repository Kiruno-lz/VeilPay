import '../happy-dom-setup';
import { describe, it, expect } from 'bun:test';
import { render } from '@testing-library/react';
import TransactionTable from './TransactionTable';
import type { TransactionRecord } from '../types';

const mockTransactions: TransactionRecord[] = [
  {
    date: new Date('2024-01-15T10:30:00Z'),
    amount: 1500000000, // 1500 USDC
    recipient: '7x9k2LmNpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz',
    type: 'deposit',
    txHash: '5xT9k2LmNpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIj',
  },
  {
    date: new Date('2024-01-14T14:20:00Z'),
    amount: 500000000, // 500 USDC
    recipient: '8yBl3MnOqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZa',
    type: 'transfer',
    txHash: '6yU3l3MnOqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJk',
  },
  {
    date: new Date('2024-01-13T09:00:00Z'),
    amount: 25000000, // 25 USDC
    recipient: '',
    type: 'receive',
    txHash: '7zV4m4NoPrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKl',
  },
];

describe('TransactionTable', () => {
  it('should render empty state when no transactions', () => {
    const { getByTestId, getByText } = render(
      <TransactionTable transactions={[]} />
    );
    expect(getByTestId('transaction-empty-state')).toBeTruthy();
    expect(getByText('No transactions found for this key')).toBeTruthy();
  });

  it('should render correct number of rows for transactions', () => {
    const { getByTestId, getAllByTestId } = render(
      <TransactionTable transactions={mockTransactions} />
    );
    expect(getByTestId('transaction-table')).toBeTruthy();
    const rows = getAllByTestId(/^transaction-row-/);
    expect(rows.length).toBe(3);
  });

  it('should render loading state with skeleton rows', () => {
    const { getByTestId, container } = render(
      <TransactionTable transactions={[]} isLoading={true} />
    );
    expect(getByTestId('transaction-loading-state')).toBeTruthy();
    // Check for skeleton rows (3 rows with animate-pulse)
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('should render error state with error message', () => {
    const errorMessage = 'Failed to load transactions';
    const { getByTestId, getByText } = render(
      <TransactionTable transactions={[]} error={errorMessage} />
    );
    expect(getByTestId('transaction-error-state')).toBeTruthy();
    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('should format dates correctly', () => {
    const { getByTestId } = render(
      <TransactionTable transactions={mockTransactions} />
    );
    const dateCell = getByTestId('transaction-date-0');
    expect(dateCell.textContent).toContain('Jan');
    expect(dateCell.textContent).toContain('15');
    expect(dateCell.textContent).toContain('2024');
  });

  it('should format amounts with USDC decimals', () => {
    const { getByTestId } = render(
      <TransactionTable transactions={mockTransactions} />
    );
    const amountCell = getByTestId('transaction-amount-0');
    expect(amountCell.textContent).toBe('1,500.00 USDC');

    const amountCell2 = getByTestId('transaction-amount-1');
    expect(amountCell2.textContent).toBe('500.00 USDC');

    const amountCell3 = getByTestId('transaction-amount-2');
    expect(amountCell3.textContent).toBe('25.00 USDC');
  });

  it('should show deposit type with blue badge', () => {
    const { getByTestId } = render(
      <TransactionTable transactions={mockTransactions} />
    );
    const typeCell = getByTestId('transaction-type-0');
    const badge = typeCell.querySelector('span');
    expect(badge?.textContent).toBe('Deposit');
    expect(badge?.classList.contains('bg-blue-900')).toBe(true);
    expect(badge?.classList.contains('text-blue-200')).toBe(true);
  });

  it('should show transfer type with purple badge', () => {
    const { getByTestId } = render(
      <TransactionTable transactions={mockTransactions} />
    );
    const typeCell = getByTestId('transaction-type-1');
    const badge = typeCell.querySelector('span');
    expect(badge?.textContent).toBe('Transfer');
    expect(badge?.classList.contains('bg-purple-900')).toBe(true);
    expect(badge?.classList.contains('text-purple-200')).toBe(true);
  });

  it('should show receive type with green badge', () => {
    const { getByTestId } = render(
      <TransactionTable transactions={mockTransactions} />
    );
    const typeCell = getByTestId('transaction-type-2');
    const badge = typeCell.querySelector('span');
    expect(badge?.textContent).toBe('Receive');
    expect(badge?.classList.contains('bg-green-900')).toBe(true);
    expect(badge?.classList.contains('text-green-200')).toBe(true);
  });

  it('should truncate tx hash to first 8 + ... + last 8', () => {
    const { getByTestId } = render(
      <TransactionTable transactions={mockTransactions} />
    );
    const txHashCell = getByTestId('transaction-txhash-0');
    const link = txHashCell.querySelector('a');
    const truncated = link?.textContent?.replace('View', '').trim();
    expect(truncated).toBe('5xT9k2Lm...CdEfGhIj');
    expect(truncated?.length).toBeLessThan(mockTransactions[0].txHash.length);
  });

  it('should link tx hash to Solana explorer', () => {
    const { getByTestId } = render(
      <TransactionTable transactions={mockTransactions} />
    );
    const txHashCell = getByTestId('transaction-txhash-0');
    const link = txHashCell.querySelector('a') as HTMLAnchorElement;
    expect(link.href).toContain('explorer.solana.com');
    expect(link.href).toContain('cluster=devnet');
    expect(link.href).toContain(mockTransactions[0].txHash);
  });

  it('should show Unknown for empty recipient', () => {
    const { getByTestId } = render(
      <TransactionTable transactions={mockTransactions} />
    );
    const recipientCell = getByTestId('transaction-recipient-2');
    expect(recipientCell.textContent).toBe('Unknown');
  });

  it('should show full recipient address when present', () => {
    const { getByTestId } = render(
      <TransactionTable transactions={mockTransactions} />
    );
    const recipientCell = getByTestId('transaction-recipient-0');
    expect(recipientCell.textContent).toBe(mockTransactions[0].recipient);
  });

  it('should prioritize error state over loading state', () => {
    const { getByTestId, queryByTestId } = render(
      <TransactionTable transactions={[]} isLoading={true} error="Network error" />
    );
    expect(getByTestId('transaction-error-state')).toBeTruthy();
    expect(queryByTestId('transaction-loading-state')).toBeNull();
  });

  it('should prioritize error state over empty state', () => {
    const { getByTestId, queryByTestId } = render(
      <TransactionTable transactions={[]} error="Network error" />
    );
    expect(getByTestId('transaction-error-state')).toBeTruthy();
    expect(queryByTestId('transaction-empty-state')).toBeNull();
  });
});
