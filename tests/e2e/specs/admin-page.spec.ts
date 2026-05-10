import { test, expect } from '@playwright/test';

test.describe('Admin page skeleton visual check', () => {
  test('page loads without white screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Wait for React to hydrate and render content
    await page.waitForSelector('[data-testid="admin-page"]', { timeout: 10000 });

    // Screenshot full page
    await page.screenshot({
      path: 'tests/e2e/screenshots/admin-page-skeleton.png',
      fullPage: true,
    });

    // Verify no white screen: background should be dark
    const bgColor = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="admin-page"]');
      if (!el) return null;
      const style = window.getComputedStyle(el);
      return style.backgroundColor;
    });
    expect(bgColor).not.toBeNull();
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
    // Tailwind bg-gray-900 is rgb(17, 24, 39)
    expect(bgColor).toBe('rgb(17, 24, 39)');
  });

  test('key elements are visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="admin-page"]', { timeout: 10000 });

    // Title
    await expect(page.locator('text=VeilPay Admin')).toBeVisible();
    // Connect Wallet button
    await expect(page.locator('text=Connect Wallet')).toBeVisible();
    // Step numbers 1-4 (rendered as plain numbers in circles)
    await expect(page.locator('text=1').first()).toBeVisible();
    await expect(page.locator('text=2').first()).toBeVisible();
    await expect(page.locator('text=3').first()).toBeVisible();
    await expect(page.locator('text=4').first()).toBeVisible();
    // Step titles (use more specific selectors to avoid strict mode violations)
    await expect(page.locator('h2', { hasText: 'Upload Recipients' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Deposit Funds' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Disburse' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Audit' })).toBeVisible();
  });

  test('responsive on iPhone SE width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="admin-page"]', { timeout: 10000 });

    // Screenshot at mobile width
    await page.screenshot({
      path: 'tests/e2e/screenshots/admin-page-mobile.png',
      fullPage: true,
    });

    // Check no horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

    // Check key elements still visible
    await expect(page.locator('text=VeilPay Admin')).toBeVisible();
    await expect(page.locator('text=Connect Wallet')).toBeVisible();
    await expect(page.locator('text=1').first()).toBeVisible();
    await expect(page.locator('text=2').first()).toBeVisible();
    await expect(page.locator('text=3').first()).toBeVisible();
    await expect(page.locator('text=4').first()).toBeVisible();
  });
});
