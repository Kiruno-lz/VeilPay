import { test, expect, type Page } from '@playwright/test';

// Pre-generated valid JWT token for testing
// Payload: { commitment: 'test-commitment-123', note: 'Test payment', amount: 100.50, recipient: 'test-recipient-456' }
const VALID_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJjb21taXRtZW50IjoidGVzdC1jb21taXRtZW50LTEyMyIsIm5vdGUiOiJUZXN0IHBheW1lbnQiLCJhbW91bnQiOjEwMC41LCJyZWNpcGllbnQiOiJ0ZXN0LXJlY2lwaWVudC00NTYiLCJpYXQiOjE3Nzg1MTg4NzQsImV4cCI6MTc3OTEyMzY3NH0.oexLFnQ77kZsnoJKR0-DEKQlpKIRwDTywkg5v0whTeE';

async function navigateWithRetry(page: Page, url: string): Promise<void> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
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

test.describe('Claim Page', () => {
  test('valid token: should display claim details and wallet section', async ({ page }) => {
    await navigateWithRetry(page, `/claim?token=${VALID_TOKEN}`);

    // Wait for React hydration
    await page.waitForSelector('[data-testid="claim-page"]', { timeout: 20000 });

    // Wait for ClaimDetails to finish loading (either valid or error state)
    await Promise.race([
      page.waitForSelector('[data-testid="claim-amount"]', { timeout: 15000 }),
      page.waitForSelector('[data-testid="claim-error"]', { timeout: 15000 }),
    ]);

    // Verify "Claim Your Tokens" heading is visible
    const heading = page.locator('h1');
    await expect(heading).toContainText('Claim Your Tokens');
    await expect(heading).toBeVisible();

    // Verify the token is displayed (truncated)
    const tokenDisplay = page.locator('[data-testid="claim-token"]');
    await expect(tokenDisplay).toBeVisible();
    const tokenText = await tokenDisplay.textContent();
    expect(tokenText).toContain('...');

    // Verify "You are receiving" text is visible
    const receivingText = page.locator('text=You are receiving');
    await expect(receivingText).toBeVisible();

    // Verify the amount is displayed correctly
    const amountDisplay = page.locator('[data-testid="claim-amount"]');
    await expect(amountDisplay).toBeVisible();
    await expect(amountDisplay).toContainText('100.50 USDC');

    // Verify "From: VeilPay Admin" is visible
    const senderDisplay = page.locator('[data-testid="claim-sender"]');
    await expect(senderDisplay).toBeVisible();
    await expect(senderDisplay).toContainText('VeilPay Admin');

    // Verify wallet connection section is visible
    const walletSection = page.locator('[data-testid="claim-wallet-section"]');
    await expect(walletSection).toBeVisible();

    // Verify connect wallet button is visible inside the claim wallet section (wallet not connected in E2E)
    const claimButton = walletSection.locator('[data-testid="connect-wallet-button"]');
    await expect(claimButton).toBeVisible();

    // Take a screenshot
    await page.screenshot({
      path: 'tests/e2e/screenshots/claim-page/01-valid-token.png',
      fullPage: true,
    });
  });

  test('invalid token: should display error state', async ({ page }) => {
    await navigateWithRetry(page, '/claim?token=invalid-token');

    // Wait for React hydration
    await page.waitForSelector('[data-testid="claim-page"]', { timeout: 20000 });

    // Verify "Invalid Claim Link" heading is visible
    const errorHeading = page.locator('h2:has-text("Invalid Claim Link")');
    await expect(errorHeading).toBeVisible();

    // Verify error message is visible
    const errorMessage = page.locator('[data-testid="claim-error"]');
    await expect(errorMessage).toBeVisible();

    // Take a screenshot
    await page.screenshot({
      path: 'tests/e2e/screenshots/claim-page/02-invalid-token.png',
      fullPage: true,
    });
  });

  test('no token: should display error state', async ({ page }) => {
    await navigateWithRetry(page, '/claim');

    // Wait for React hydration
    await page.waitForSelector('[data-testid="claim-page"]', { timeout: 20000 });

    // Verify "Invalid Claim Link" heading is visible
    const errorHeading = page.locator('h1:has-text("Invalid Claim Link")');
    await expect(errorHeading).toBeVisible();

    // Take a screenshot
    await page.screenshot({
      path: 'tests/e2e/screenshots/claim-page/03-no-token.png',
      fullPage: true,
    });
  });

  test('responsive on iPhone SE: should display correctly on mobile viewport', async ({ page }) => {
    // Set viewport to iPhone SE dimensions
    await page.setViewportSize({ width: 375, height: 667 });

    await navigateWithRetry(page, `/claim?token=${VALID_TOKEN}`);

    // Wait for React hydration
    await page.waitForSelector('[data-testid="claim-page"]', { timeout: 20000 });

    // Wait for ClaimDetails to finish loading (either valid or error state)
    await Promise.race([
      page.waitForSelector('[data-testid="claim-amount"]', { timeout: 15000 }),
      page.waitForSelector('[data-testid="claim-error"]', { timeout: 15000 }),
    ]);

    // Verify no horizontal scroll
    const body = page.locator('body');
    const scrollWidth = await body.evaluate((el) => el.scrollWidth);
    const clientWidth = await body.evaluate((el) => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

    // Verify key elements are visible
    const heading = page.locator('h1');
    await expect(heading).toContainText('Claim Your Tokens');
    await expect(heading).toBeVisible();

    const amountDisplay = page.locator('[data-testid="claim-amount"]');
    await expect(amountDisplay).toBeVisible();
    await expect(amountDisplay).toContainText('100.50 USDC');

    const walletSection = page.locator('[data-testid="claim-wallet-section"]');
    await expect(walletSection).toBeVisible();

    const claimButton = walletSection.locator('[data-testid="connect-wallet-button"]');
    await expect(claimButton).toBeVisible();

    // Take a screenshot
    await page.screenshot({
      path: 'tests/e2e/screenshots/claim-page/04-mobile.png',
      fullPage: true,
    });
  });
});
