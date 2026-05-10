import { test, expect } from '@playwright/test';

test.describe('Audit Page', () => {
  test('should display audit page elements and enable decrypt on input', async ({ page }) => {
    // Navigate to the audit page and wait for full load
    // Retry navigation to handle race condition with Vite dev server startup
    let lastError: Error | undefined;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await page.goto('/audit', { waitUntil: 'networkidle' });
        lastError = undefined;
        break;
      } catch (e) {
        lastError = e as Error;
        if (attempt < 2) {
          await page.waitForTimeout(1000);
        }
      }
    }
    if (lastError) {
      throw lastError;
    }

    // Verify page heading contains "Audit"
    const heading = page.locator('h1');
    await expect(heading).toContainText('Audit');

    // Verify key-input textarea is visible
    const keyInput = page.getByTestId('key-input');
    await expect(keyInput).toBeVisible();

    // Verify decrypt-button is visible and initially disabled
    const decryptButton = page.getByTestId('decrypt-button');
    await expect(decryptButton).toBeVisible();
    await expect(decryptButton).toBeDisabled();

    // Verify transaction-table-placeholder shows the expected text
    const tablePlaceholder = page.getByTestId('transaction-table-placeholder');
    await expect(tablePlaceholder).toBeVisible();
    await expect(tablePlaceholder).toContainText('Enter viewing key to see history');

    // Verify export-button is visible and initially disabled
    const exportButton = page.getByTestId('export-button');
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toBeDisabled();

    // Type a test key in the textarea
    await keyInput.fill('test-viewing-key-12345');

    // Verify decrypt-button becomes enabled
    await expect(decryptButton).toBeEnabled();

    // Verify export-button also becomes enabled
    await expect(exportButton).toBeEnabled();

    // Verify placeholder text updates after input
    await expect(tablePlaceholder).toContainText('Press "Decrypt History" to load transactions');

    // Take a screenshot of the page
    await page.screenshot({ path: 'tests/e2e/screenshots/audit-page.png', fullPage: true });
  });
});
