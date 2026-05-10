import { describe, it, expect } from 'bun:test';
import { render } from '@testing-library/react';
import AuditPage from './AuditPage';

describe('AuditPage', () => {
  it('should render with data-testid="audit-page"', () => {
    const { getByTestId } = render(<AuditPage />);
    expect(getByTestId('audit-page')).toBeTruthy();
  });

  it('should render key-input textarea', () => {
    const { getByTestId } = render(<AuditPage />);
    expect(getByTestId('key-input')).toBeTruthy();
  });

  it('should render decrypt-button', () => {
    const { getByTestId } = render(<AuditPage />);
    expect(getByTestId('decrypt-button')).toBeTruthy();
  });

  it('should show "Enter viewing key to see history" when key is empty', () => {
    const { getByTestId } = render(<AuditPage />);
    const placeholder = getByTestId('transaction-table-placeholder');
    expect(placeholder.textContent).toContain('Enter viewing key to see history');
  });

  it('should render export-button', () => {
    const { getByTestId } = render(<AuditPage />);
    expect(getByTestId('export-button')).toBeTruthy();
  });
});
