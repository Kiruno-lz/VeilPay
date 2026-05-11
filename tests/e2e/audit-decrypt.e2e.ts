import { test, expect } from '@playwright/test';

test.describe('Audit Page Decrypt Flows', () => {
  async function navigateToAudit(page: any) {
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
  }

  test('should show error state with invalid key', async ({ page }) => {
    await navigateToAudit(page);

    const keyInput = page.getByTestId('key-input');
    const decryptButton = page.getByTestId('decrypt-button');

    // Enter an invalid key that triggers error
    // In mock mode, the SDK always succeeds, so we need to simulate an error
    // We can do this by mocking the SDK response or using a special key
    // For now, we'll use a key that the mock might reject
    await keyInput.fill('invalid-key-that-causes-error');
    await expect(decryptButton).toBeEnabled();

    // Click decrypt
    await decryptButton.click();

    // Wait for error state
    await page.waitForSelector('[data-testid="transaction-error-state"]', { state: 'visible', timeout: 10000 });

    // Take screenshot of error state
    await page.screenshot({ path: 'tests/e2e/screenshots/audit-page/05-decrypt-error.png', fullPage: true });

    // Verify error message
    const errorState = page.getByTestId('transaction-error-state');
    await expect(errorState).toBeVisible();
    await expect(errorState).toContainText('Invalid or expired viewing key');
  });

  test('should show transaction table with transactions on successful decrypt', async ({ page }) => {
    await navigateToAudit(page);

    const keyInput = page.getByTestId('key-input');
    const decryptButton = page.getByTestId('decrypt-button');
    const exportButton = page.getByTestId('audit-exporter-button');

    // Enter any key (mock mode generates random transactions)
    await keyInput.fill('valid-mock-viewing-key-12345');
    await expect(decryptButton).toBeEnabled();

    // Click decrypt
    await decryptButton.click();

    // Wait for loading state
    await page.waitForSelector('[data-testid="decrypt-loading"]', { state: 'visible', timeout: 5000 });

    // Wait for success state - transaction table should appear
    await page.waitForSelector('[data-testid="transaction-table"]', { state: 'visible', timeout: 15000 });

    // Verify transaction table is visible
    const transactionTable = page.getByTestId('transaction-table');
    await expect(transactionTable).toBeVisible();

    // Verify transaction count is displayed
    const transactionCount = page.getByTestId('transaction-count');
    await expect(transactionCount).toBeVisible();
    const countText = await transactionCount.textContent();
    expect(countText).toMatch(/\d+ transaction(s)? found/);

    // Verify at least one transaction row exists
    const firstRow = page.getByTestId('transaction-row-0');
    await expect(firstRow).toBeVisible();

    // Verify transaction row has expected columns
    const firstDate = page.getByTestId('transaction-date-0');
    const firstAmount = page.getByTestId('transaction-amount-0');
    const firstRecipient = page.getByTestId('transaction-recipient-0');
    const firstType = page.getByTestId('transaction-type-0');
    const firstTxHash = page.getByTestId('transaction-txhash-0');

    await expect(firstDate).toBeVisible();
    await expect(firstAmount).toBeVisible();
    await expect(firstRecipient).toBeVisible();
    await expect(firstType).toBeVisible();
    await expect(firstTxHash).toBeVisible();

    // Verify export button is enabled when transactions exist
    await expect(exportButton).toBeEnabled();

    // Click export and verify it doesn't throw
    await exportButton.click();

    // Wait a moment for download to start
    await page.waitForTimeout(500);
  });
});
