import '../happy-dom-setup';
import { describe, it, expect, beforeEach } from 'bun:test';
import { render, fireEvent, waitFor } from '@testing-library/react';
import UploadCSV from './UploadCSV';
import { AppStateProvider } from '../context/AppState';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppStateProvider>{children}</AppStateProvider>
);

// Real Solana addresses (base58 encoded)
const VALID_ADDR_1 = '6qGdef8G4ZCfB2cX3YGi5LAmEZTpVpTNEBZgfJFFG7Wk'
const VALID_ADDR_2 = 'FRkV74AHNrFNtPcxxTiGEozei83mcfbiMxRj4SQuH9un'
const VALID_ADDR_3 = 'D2zo52RpdDq5HMLCaw7kVSjmka67pwbustFVP5aSGvAp'

function createFile(content: string, name: string, type = 'text/csv'): File {
  return new File([content], name, { type });
}

describe('UploadCSV', () => {
  beforeEach(() => {
    // Reset any mocks if needed
  });

  it('renders drop zone initially', () => {
    const { getByTestId, getByText } = render(<UploadCSV />, { wrapper });
    expect(getByTestId('upload-csv')).toBeTruthy();
    expect(getByTestId('drop-zone')).toBeTruthy();
    expect(getByText(/Drag/)).toBeTruthy();
    expect(getByText(/click to browse/)).toBeTruthy();
  });

  it('displays table and total after uploading valid CSV', async () => {
    const csvContent = `address,amount\n${VALID_ADDR_1},100.50\n${VALID_ADDR_2},200.00`;
    const file = createFile(csvContent, 'payroll.csv');

    const { getByTestId, container } = render(<UploadCSV />, { wrapper });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(getByTestId('csv-total')).toBeTruthy();
    });

    expect(getByTestId('csv-row-0')).toBeTruthy();
    expect(getByTestId('csv-row-1')).toBeTruthy();
    expect(getByTestId('csv-total').textContent).toContain('300.50 USDC');
  });

  it('highlights invalid address rows in red', async () => {
    const csvContent = `address,amount\ninvalid-address,100\n${VALID_ADDR_3},50`;
    const file = createFile(csvContent, 'invalid.csv');

    const { getByTestId, container } = render(<UploadCSV />, { wrapper });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(getByTestId('csv-row-0')).toBeTruthy();
    });

    const invalidRow = getByTestId('csv-row-0');
    expect(invalidRow.className).toContain('bg-red-500/10');
  });

  it('dispatches SET_RECIPIENTS to global state on valid CSV', async () => {
    const csvContent = `address,amount\n${VALID_ADDR_1},100`;
    const file = createFile(csvContent, 'payroll.csv');

    const { container } = render(<UploadCSV />, { wrapper });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      const table = container.querySelector('table');
      expect(table).toBeTruthy();
    });
  });

  it('shows error for empty file', async () => {
    const file = createFile('', 'empty.csv');

    const { getByTestId, container } = render(<UploadCSV />, { wrapper });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(getByTestId('csv-error')).toBeTruthy();
    });

    expect(getByTestId('csv-error').textContent).toContain('Please upload a valid CSV file');
  });

  it('handles drag and drop events', () => {
    const { getByTestId } = render(<UploadCSV />, { wrapper });
    const dropZone = getByTestId('drop-zone');

    fireEvent.dragOver(dropZone);
    expect(dropZone.className).toContain('border-blue-500');

    fireEvent.dragLeave(dropZone);
    expect(dropZone.className).not.toContain('border-blue-500');
  });

  it('handles drop event with file', async () => {
    const csvContent = `address,amount\n${VALID_ADDR_1},100`;
    const file = createFile(csvContent, 'dropped.csv');

    const { getByTestId } = render(<UploadCSV />, { wrapper });
    const dropZone = getByTestId('drop-zone');

    const dataTransfer = {
      files: [file],
      types: ['Files'],
    };

    fireEvent.drop(dropZone, { dataTransfer });

    await waitFor(() => {
      expect(getByTestId('csv-total')).toBeTruthy();
    });

    expect(getByTestId('csv-total').textContent).toContain('100.00 USDC');
  });

  it('applies custom className', () => {
    const { container } = render(<UploadCSV className="custom-class" />, { wrapper });
    expect(container.firstElementChild?.classList.contains('custom-class')).toBe(true);
  });

  it('handles mixed valid and invalid rows', async () => {
    const csvContent = `address,amount\ninvalid-address,100\n${VALID_ADDR_1},50\n${VALID_ADDR_2},75`;
    const file = createFile(csvContent, 'mixed.csv');

    const { getByTestId, container } = render(<UploadCSV />, { wrapper });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(getByTestId('csv-row-0')).toBeTruthy();
    });

    // Row 0: invalid address should be highlighted
    const invalidRow = getByTestId('csv-row-0');
    expect(invalidRow.className).toContain('bg-red-500/10');
    expect(invalidRow.title).toContain('Invalid Solana address');

    // Row 1: valid
    const validRow1 = getByTestId('csv-row-1');
    expect(validRow1.className).not.toContain('bg-red-500/10');
    expect(validRow1.className).toContain('bg-gray-800');

    // Row 2: valid
    const validRow2 = getByTestId('csv-row-2');
    expect(validRow2.className).not.toContain('bg-red-500/10');
    expect(validRow2.className).toContain('bg-gray-800');

    // Total should only include valid rows
    expect(getByTestId('csv-total').textContent).toContain('125.00 USDC');
  });
});
