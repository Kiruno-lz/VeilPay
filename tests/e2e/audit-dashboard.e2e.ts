import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = 'tests/e2e/screenshots/audit-dashboard';

test.describe('AuditDashboard E2E Visual Check', () => {
  test('should render empty state and generate key', async ({ page }) => {
    // Navigate and wait for the dev server to be fully ready
    await page.goto('/', { waitUntil: 'networkidle' });
    // Wait for React to hydrate: the admin-page container must exist
    await page.waitForSelector('[data-testid="admin-page"]', { timeout: 20000 });
    // Wait for the main content (steps) to render, not just the header
    await page.waitForSelector('main h2', { timeout: 20000 });

    // Scroll to Audit section (step 4)
    const auditSection = page.locator('section', { has: page.locator('h2', { hasText: 'Audit' }) });
    await auditSection.scrollIntoViewIfNeeded();
    await expect(auditSection).toBeVisible();

    // Wait for the AuditDashboard component to render inside the section
    await page.waitForSelector('[data-testid="audit-dashboard"]', { timeout: 10000 });

    // Verify "Generate Key" button exists
    const generateBtn = page.locator('button', { hasText: 'Generate Key' });
    await expect(generateBtn).toBeVisible();

    // Verify empty state
    const emptyState = page.locator('text=Viewing keys will appear here');
    await expect(emptyState).toBeVisible();

    // Screenshot: empty state
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/01-empty-state.png`,
      fullPage: true,
    });

    // Click generate
    await generateBtn.click();

    // Wait for generating to finish (button text changes back)
    await expect(generateBtn).toHaveText('Generate Key', { timeout: 15000 });

    // Wait a bit for the React state update to render the key row
    await page.waitForTimeout(500);

    // Verify key row appears
    const keyRow = page.locator('[data-testid="key-row-0"]');
    await expect(keyRow).toBeVisible({ timeout: 10000 });

    // Verify key text
    const keyText = page.locator('code');
    await expect(keyText).toBeVisible();

    // Verify scope label
    const scopeLabel = page.locator('text=Scope:');
    await expect(scopeLabel).toBeVisible();

    // Verify created label
    const createdLabel = page.locator('text=Created:');
    await expect(createdLabel).toBeVisible();

    // Verify expires label
    const expiresLabel = page.locator('text=Expires:');
    await expect(expiresLabel).toBeVisible();

    // Verify Active status
    const activeStatus = page.locator('text=Active');
    await expect(activeStatus).toBeVisible();

    // Verify Copy button
    const copyBtn = page.locator('[data-testid="copy-key-0"]');
    await expect(copyBtn).toBeVisible();

    // Verify Revoke button
    const revokeBtn = page.locator('[data-testid="revoke-key-0"]');
    await expect(revokeBtn).toBeVisible();

    // Screenshot: generated key state
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/02-generated-key.png`,
      fullPage: true,
    });

    // Test copy
    await copyBtn.click();
    // Playwright clipboard access is limited in headless; just verify button is clickable

    // Test revoke
    await revokeBtn.click();

    // Verify status changes to Revoked
    const revokedStatus = page.locator('text=Revoked');
    await expect(revokedStatus).toBeVisible({ timeout: 5000 });

    // Verify Revoke button disappears
    await expect(revokeBtn).not.toBeVisible();

    // Verify gray styling on key row
    const rowClass = await keyRow.getAttribute('class');
    expect(rowClass).toMatch(/opacity-50/);
    expect(rowClass).toMatch(/grayscale/);

    // Screenshot: revoked state
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/03-revoked-state.png`,
      fullPage: true,
    });
  });

  test('responsive on iPhone SE width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });
    // Wait for React to hydrate: the admin-page container must exist
    await page.waitForSelector('[data-testid="admin-page"]', { timeout: 20000 });
    // Wait for the main content (steps) to render, not just the header
    await page.waitForSelector('main h2', { timeout: 20000 });

    // Scroll to Audit section
    const auditSection = page.locator('section', { has: page.locator('h2', { hasText: 'Audit' }) });
    await auditSection.scrollIntoViewIfNeeded();
    await expect(auditSection).toBeVisible();

    // Wait for the AuditDashboard component to render inside the section
    await page.waitForSelector('[data-testid="audit-dashboard"]', { timeout: 10000 });

    // Screenshot: mobile view
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/04-mobile-responsive.png`,
      fullPage: true,
    });

    // Check no horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

    // Verify key elements still visible
    await expect(page.locator('button', { hasText: 'Generate Key' })).toBeVisible();
    await expect(page.locator('text=Viewing keys will appear here')).toBeVisible();
  });
});
