import '../happy-dom-setup';
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { render, fireEvent } from '@testing-library/react';
import { AuditExporter } from './AuditExporter';
import type { TransactionRecord } from '../types';

// Mock URL.createObjectURL and URL.revokeObjectURL for happy-dom
const mockCreateObjectURL = mock(() => 'blob:mock-url');
const mockRevokeObjectURL = mock(() => {});

// Store original methods to restore later
const originalCreateObjectURL = global.URL?.createObjectURL;
const originalRevokeObjectURL = global.URL?.revokeObjectURL;

// Track created blob and downloaded filename
let lastBlob: Blob | null = null;
let lastDownloadFilename: string | null = null;

// Mock document.createElement('a') to capture click and download
const originalCreateElement = document.createElement.bind(document);

function mockCreateElement(tagName: string): HTMLElement {
  const el = originalCreateElement(tagName);
  if (tagName.toLowerCase() === 'a') {
    const anchor = el as HTMLAnchorElement;
    const originalClick = anchor.click.bind(anchor);
    anchor.click = () => {
      lastDownloadFilename = anchor.download;
      originalClick();
    };
  }
  return el;
}

const mockTransactions: TransactionRecord[] = [
  {
    date: new Date('2024-01-15T10:30:00.000Z'),
    amount: 1500.5,
    recipient: 'Alice',
    type: 'transfer',
    txHash: 'txhash123abc',
  },
  {
    date: new Date('2024-01-16T14:45:00.000Z'),
    amount: 2500,
    recipient: 'Bob',
    type: 'deposit',
    txHash: 'txhash456def',
  },
  {
    date: new Date('2024-01-17T09:00:00.000Z'),
    amount: 999.99,
    recipient: 'Charlie',
    type: 'receive',
    txHash: 'txhash789ghi',
  },
];

describe('AuditExporter', () => {
  beforeEach(() => {
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();
    lastBlob = null;
    lastDownloadFilename = null;

    // Override URL methods on the global URL constructor if needed
    if (global.URL) {
      (global.URL as unknown as Record<string, unknown>).createObjectURL = (blob: Blob) => {
        lastBlob = blob;
        return mockCreateObjectURL(blob);
      };
      (global.URL as unknown as Record<string, unknown>).revokeObjectURL = mockRevokeObjectURL;
    }

    // Override document.createElement to intercept anchor clicks
    document.createElement = mockCreateElement as unknown as typeof document.createElement;
  });

  it('should render with transactions and button is enabled', () => {
    const { getByTestId } = render(<AuditExporter transactions={mockTransactions} />);
    const button = getByTestId('audit-exporter-button') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  it('should render with no transactions and button is disabled', () => {
    const { getByTestId } = render(<AuditExporter transactions={[]} />);
    const button = getByTestId('audit-exporter-button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should render with disabled prop and button is disabled', () => {
    const { getByTestId } = render(
      <AuditExporter transactions={mockTransactions} disabled={true} />
    );
    const button = getByTestId('audit-exporter-button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should export CSV with correct content format when clicked', async () => {
    const { getByTestId } = render(<AuditExporter transactions={mockTransactions} />);
    const button = getByTestId('audit-exporter-button');

    fireEvent.click(button);

    // Verify blob was created
    expect(lastBlob).not.toBeNull();
    expect(lastBlob?.type).toBe('text/csv;charset=utf-8;');

    // Read blob content using async text() method
    const csvContent = await lastBlob!.text();

    const expectedCSV = [
      'Date,Amount (USDC),Recipient,Type,Tx Hash',
      '2024-01-15T10:30:00.000Z,1500.50,Alice,transfer,txhash123abc',
      '2024-01-16T14:45:00.000Z,2500.00,Bob,deposit,txhash456def',
      '2024-01-17T09:00:00.000Z,999.99,Charlie,receive,txhash789ghi',
    ].join('\n');

    expect(csvContent).toBe(expectedCSV);
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('should generate filename in veilpay-audit-YYYY-MM-DD.csv format', () => {
    const { getByTestId } = render(<AuditExporter transactions={mockTransactions} />);
    const button = getByTestId('audit-exporter-button');

    fireEvent.click(button);

    expect(lastDownloadFilename).not.toBeNull();
    expect(lastDownloadFilename).toMatch(/^veilpay-audit-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it('should have correct CSV headers', async () => {
    const { getByTestId } = render(<AuditExporter transactions={mockTransactions} />);
    const button = getByTestId('audit-exporter-button');

    fireEvent.click(button);

    const csvContent = await lastBlob!.text();
    const lines = csvContent.split('\n');
    expect(lines[0]).toBe('Date,Amount (USDC),Recipient,Type,Tx Hash');
  });

  it('should include all transaction data in CSV rows', async () => {
    const { getByTestId } = render(<AuditExporter transactions={mockTransactions} />);
    const button = getByTestId('audit-exporter-button');

    fireEvent.click(button);

    const csvContent = await lastBlob!.text();
    const lines = csvContent.split('\n');
    // Header + 3 transactions = 4 lines
    expect(lines.length).toBe(4);
    // Verify each transaction row contains the expected data
    expect(lines[1]).toContain('Alice');
    expect(lines[1]).toContain('transfer');
    expect(lines[1]).toContain('txhash123abc');
    expect(lines[2]).toContain('Bob');
    expect(lines[2]).toContain('deposit');
    expect(lines[2]).toContain('txhash456def');
    expect(lines[3]).toContain('Charlie');
    expect(lines[3]).toContain('receive');
    expect(lines[3]).toContain('txhash789ghi');
  });

  it('should clean up object URL after download', () => {
    const { getByTestId } = render(<AuditExporter transactions={mockTransactions} />);
    const button = getByTestId('audit-exporter-button');

    fireEvent.click(button);

    expect(mockRevokeObjectURL).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should not trigger export when button is disabled', () => {
    const { getByTestId } = render(<AuditExporter transactions={[]} />);
    const button = getByTestId('audit-exporter-button');

    fireEvent.click(button);

    expect(mockCreateObjectURL).not.toHaveBeenCalled();
    expect(mockRevokeObjectURL).not.toHaveBeenCalled();
  });
});
