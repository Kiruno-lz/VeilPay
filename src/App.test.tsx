import { describe, it, expect } from 'bun:test';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App routing', () => {
  it('should render AdminPage at /', () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(getByTestId('admin-page')).toBeTruthy();
  });

  it('should render ClaimPage at /claim with query param', () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/claim?token=eyJhbG...']}>
        <App />
      </MemoryRouter>
    );
    expect(getByTestId('claim-page')).toBeTruthy();
  });

  it('should render AuditPage at /audit', () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/audit']}>
        <App />
      </MemoryRouter>
    );
    expect(getByTestId('audit-page')).toBeTruthy();
  });

  it('should render NotFoundPage for unknown routes', () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/unknown']}>
        <App />
      </MemoryRouter>
    );
    expect(getByTestId('not-found-page')).toBeTruthy();
  });
});
