import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Auto-cleanup after each test and clear document.body
afterEach(() => {
  cleanup();
  // Clear body after cleanup to ensure no leftover elements
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
});
