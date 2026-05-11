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

    // Verify export-button wrapper is visible; the actual button is inside AuditExporter
    const exportButtonWrapper = page.getByTestId('export-button');
    await expect(exportButtonWrapper).toBeVisible();
    const exportButton = exportButtonWrapper.locator('button');
    await expect(exportButton).toBeDisabled();

    // Take screenshot of empty state
    await page.screenshot({ path: 'tests/e2e/screenshots/audit-page/01-empty-state.png', fullPage: true });

    // Type a test key in the textarea
    await keyInput.fill('test-viewing-key-12345');

    // Take screenshot with key entered
    await page.screenshot({ path: 'tests/e2e/screenshots/audit-page/02-with-key.png', fullPage: true });

    // Verify decrypt-button becomes enabled
    await expect(decryptButton).toBeEnabled();

    // Click decrypt button
    await decryptButton.click();

    // Wait for loading state
    await page.waitForSelector('[data-testid="decrypt-loading"]', { state: 'visible', timeout: 5000 });

    // Take screenshot of loading state
    await page.screenshot({ path: 'tests/e2e/screenshots/audit-page/03-decrypt-loading.png', fullPage: true });

    // Wait for success state (either transaction table or empty state)
    await Promise.race([
      page.waitForSelector('[data-testid="transaction-table"]', { state: 'visible', timeout: 10000 }),
      page.waitForSelector('[data-testid="transaction-empty-state"]', { state: 'visible', timeout: 10000 }),
    ]);

    // Take screenshot of success state
    await page.screenshot({ path: 'tests/e2e/screenshots/audit-page/04-decrypt-success.png', fullPage: true });

    // Check if transactions exist
    const transactionTable = page.locator('[data-testid="transaction-table"]');
    const transactionCount = page.getByTestId('transaction-count');
    const isTableVisible = await transactionTable.isVisible().catch(() => false);

    if (isTableVisible) {
      // Verify transaction count is displayed
      await expect(transactionCount).toBeVisible();
      const countText = await transactionCount.textContent();
      expect(countText).toMatch(/\d+ transaction(s)? found/);

      // Verify at least one transaction row exists
      const firstRow = page.getByTestId('transaction-row-0');
      await expect(firstRow).toBeVisible();

      // Verify export button is enabled when transactions exist
      await expect(exportButton).toBeEnabled();
    } else {
      // If no transactions, verify empty state
      const emptyState = page.getByTestId('transaction-empty-state');
      await expect(emptyState).toBeVisible();
      await expect(emptyState).toContainText('No transactions found for this key');

      // Verify export button remains disabled when no transactions
      await expect(exportButton).toBeDisabled();
    }
  });
});
