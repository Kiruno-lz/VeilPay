import { test, expect } from '@playwright/test';

test.describe('DepositCard component visual check', () => {
  test('DepositCard renders correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="admin-page"]', { timeout: 10000 });

    // Wait for the DepositCard component
    await page.waitForSelector('[data-testid="deposit-card"]', { timeout: 10000 });

    // Take screenshot of full page
    await page.screenshot({
      path: 'tests/e2e/screenshots/deposit-card.png',
      fullPage: true,
    });

    // Verify component is visible
    const depositCard = page.locator('[data-testid="deposit-card"]');
    await expect(depositCard).toBeVisible();

    // Verify styling: bg-gray-800, border, rounded-lg
    const cardClasses = await depositCard.evaluate((el) => el.className);
    expect(cardClasses).toMatch(/bg-gray-800/);
    expect(cardClasses).toMatch(/border/);
    expect(cardClasses).toMatch(/rounded-lg/);

    // Verify step number "2" is visible
    // The step number is inside the deposit card, so scope to it
    const stepNumber = depositCard.locator('text=2');
    await expect(stepNumber).toBeVisible();

    // Verify "Deposit" heading is visible
    const depositHeading = depositCard.locator('h3', { hasText: 'Deposit' });
    await expect(depositHeading).toBeVisible();

    // Since wallet is not connected, verify the disconnected state message
    await expect(depositCard).toContainText('Connect wallet to deposit');
  });
});
