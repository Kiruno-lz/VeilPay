import '../happy-dom-setup';
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { render, waitFor } from '@testing-library/react';
import { ClaimDetails } from './ClaimDetails';
import type { ClaimPayload } from '../lib/claimLink';

// Mock parseClaimToken
const mockParseClaimToken = mock(() => Promise.resolve<ClaimPayload | null>(null));

mock.module('../lib/claimLink', () => ({
  parseClaimToken: (token: string) => mockParseClaimToken(token),
}));

describe('ClaimDetails', () => {
  beforeEach(() => {
    mockParseClaimToken.mockClear();
  });

  it('renders loading state initially', () => {
    mockParseClaimToken.mockImplementation(() => new Promise(() => {}));
    const { getByTestId } = render(<ClaimDetails token="valid-token" />);
    expect(getByTestId('claim-loading')).toBeTruthy();
  });

  it('shows correct amount for valid token', async () => {
    mockParseClaimToken.mockResolvedValue({
      commitment: 'abc123',
      note: 'test note',
      amount: 1234.56,
      recipient: 'recipient-address',
    });
    const { getByTestId, getByText } = render(<ClaimDetails token="valid-token" />);
    await waitFor(() => expect(getByTestId('claim-amount')).toBeTruthy());
    expect(getByText((content) => content.includes('1,234.56') && content.includes('USDC'))).toBeTruthy();
  });

  it('shows sender info for valid token', async () => {
    mockParseClaimToken.mockResolvedValue({
      commitment: 'abc123',
      note: 'test note',
      amount: 100,
      recipient: 'recipient-address',
    });
    const { getByTestId, getByText } = render(<ClaimDetails token="valid-token" />);
    await waitFor(() => expect(getByTestId('claim-sender')).toBeTruthy());
    expect(getByText((content) => content.includes('VeilPay Admin'))).toBeTruthy();
  });

  it('shows error for invalid token', async () => {
    mockParseClaimToken.mockResolvedValue(null);
    const { getByTestId, getByText } = render(<ClaimDetails token="invalid-token" />);
    await waitFor(() => expect(getByTestId('claim-error')).toBeTruthy());
    expect(getByText('Invalid Claim Link')).toBeTruthy();
  });

  it('shows error for malformed token', async () => {
    mockParseClaimToken.mockResolvedValue(null);
    const { getByTestId, getByText } = render(<ClaimDetails token="not-a-jwt" />);
    await waitFor(() => expect(getByTestId('claim-error')).toBeTruthy());
    expect(getByText('Invalid Claim Link')).toBeTruthy();
  });

  it('shows "Already claimed" when appropriate', async () => {
    mockParseClaimToken.mockResolvedValue({
      commitment: 'abc123',
      note: 'test note',
      amount: 100,
      recipient: 'recipient-address',
    });
    const { getByTestId, getByText } = render(<ClaimDetails token="claimed-token" alreadyClaimed />);
    await waitFor(() => expect(getByTestId('claim-already-claimed')).toBeTruthy());
    expect(getByText(/Already claimed/i)).toBeTruthy();
  });
});
