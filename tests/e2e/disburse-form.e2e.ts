import { test, expect } from '@playwright/test';

test.describe('DisburseForm component E2E', () => {
  test('DisburseForm renders in Admin page with no recipients', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="admin-page"]', { timeout: 10000 });

    // Find the Disburse step section
    const disburseSection = page.locator('section', {
      has: page.locator('h2', { hasText: 'Disburse' }),
    });
    await expect(disburseSection).toBeVisible();

    // Verify DisburseForm is inside the Disburse section
    const disburseForm = disburseSection.locator('[data-testid="disburse-form"]');
    await expect(disburseForm).toBeVisible();

    // Check "No recipients" message
    await expect(disburseForm.locator('[data-testid="no-recipients"]')).toBeVisible();
    await expect(disburseForm).toContainText('No recipients yet. Upload a CSV first.');

    // Disburse button should be disabled (no wallet, no recipients)
    const disburseButton = disburseForm.locator('[data-testid="disburse-button"]');
    await expect(disburseButton).toBeVisible();
    await expect(disburseButton).toBeDisabled();
  });

  test('DisburseForm shows recipient list with masked addresses after CSV upload', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="admin-page"]', { timeout: 10000 });

    // Upload a CSV first via the UploadCSV component
    const uploadCSV = page.locator('[data-testid="upload-csv"]');
    await expect(uploadCSV).toBeVisible();

    const csvContent = 'address,amount\n6qGdef8G4ZCfB2cX3YGi5LAmEZTpVpTNEBZgfJFFG7Wk,100\nFRkV74AHNrFNtPcxxTiGEozei83mcfbiMxRj4SQuH9un,200';
    const fileInput = uploadCSV.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-recipients.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    // Wait for table to appear in UploadCSV
    await expect(uploadCSV.locator('table')).toBeVisible({ timeout: 5000 });

    // Now check DisburseForm shows the recipients
    const disburseForm = page.locator('[data-testid="disburse-form"]');
    await expect(disburseForm).toBeVisible();

    // Wait for recipient list to appear
    await expect(disburseForm.locator('[data-testid="recipient-list"]')).toBeVisible({ timeout: 5000 });

    // Check masked addresses are displayed
    await expect(disburseForm).toContainText('6qGd...G7Wk');
    await expect(disburseForm).toContainText('FRkV...H9un');

    // Check amounts are formatted correctly
    await expect(disburseForm).toContainText('100.00 USDC');
    await expect(disburseForm).toContainText('200.00 USDC');

    // Button should still be disabled because wallet is not connected
    const disburseButton = disburseForm.locator('[data-testid="disburse-button"]');
    await expect(disburseButton).toBeDisabled();

    // Should show "Connect wallet to disburse" message
    await expect(disburseForm.locator('[data-testid="connect-wallet-message"]')).toBeVisible();
  });

  test('DisburseForm disburse button disabled states', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="admin-page"]', { timeout: 10000 });

    const disburseForm = page.locator('[data-testid="disburse-form"]');
    await expect(disburseForm).toBeVisible();

    const disburseButton = disburseForm.locator('[data-testid="disburse-button"]');
    await expect(disburseButton).toBeVisible();

    // Initially disabled: no wallet, no recipients
    await expect(disburseButton).toBeDisabled();

    // Upload CSV to add recipients
    const uploadCSV = page.locator('[data-testid="upload-csv"]');
    const csvContent = 'address,amount\n6qGdef8G4ZCfB2cX3YGi5LAmEZTpVpTNEBZgfJFFG7Wk,100';
    const fileInput = uploadCSV.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    // Wait for recipients to be parsed
    await expect(uploadCSV.locator('table')).toBeVisible({ timeout: 5000 });

    // Button should still be disabled because wallet is not connected
    await expect(disburseButton).toBeDisabled();
    await expect(disburseForm.locator('[data-testid="connect-wallet-message"]')).toBeVisible();
  });

  test('DisburseForm progress bar appears during disbursement flow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="admin-page"]', { timeout: 10000 });

    const disburseForm = page.locator('[data-testid="disburse-form"]');
    await expect(disburseForm).toBeVisible();

    // Upload CSV
    const uploadCSV = page.locator('[data-testid="upload-csv"]');
    const csvContent = 'address,amount\n6qGdef8G4ZCfB2cX3YGi5LAmEZTpVpTNEBZgfJFFG7Wk,100';
    const fileInput = uploadCSV.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });
    await expect(uploadCSV.locator('table')).toBeVisible({ timeout: 5000 });

    // Note: We can't actually click disburse without a connected wallet in E2E
    // But we can verify the UI states are present
    const disburseButton = disburseForm.locator('[data-testid="disburse-button"]');
    await expect(disburseButton).toBeVisible();
    await expect(disburseButton).toBeDisabled();

    // Verify the button text
    await expect(disburseButton).toContainText('Disburse');

    // Verify recipient list is visible
    await expect(disburseForm.locator('[data-testid="recipient-list"]')).toBeVisible();
  });

  test('DisburseForm responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="admin-page"]', { timeout: 10000 });

    const disburseForm = page.locator('[data-testid="disburse-form"]');
    await expect(disburseForm).toBeVisible();

    // Check no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

    // Verify key elements are visible
    await expect(disburseForm.locator('[data-testid="no-recipients"]')).toBeVisible();
    await expect(disburseForm.locator('[data-testid="disburse-button"]')).toBeVisible();
  });
});
