import { describe, it, expect } from 'bun:test';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App routing', () => {
  it('should render AdminPage at /', () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </MemoryRouter>
    );
    expect(getByTestId('admin-page')).toBeTruthy();
  });

  it('should render ClaimPage at /claim with query param', () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/claim?token=eyJhbG...']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </MemoryRouter>
    );
    expect(getByTestId('claim-page')).toBeTruthy();
  });

  it('should render AuditPage at /audit', () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/audit']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </MemoryRouter>
    );
    expect(getByTestId('audit-page')).toBeTruthy();
  });

  it('should render NotFoundPage for unknown routes', () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/unknown']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </MemoryRouter>
    );
    expect(getByTestId('not-found-page')).toBeTruthy();
  });
});
