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
    // Connect Wallet button (use data-testid to avoid strict mode violation with "Connect wallet to deposit" text)
    await expect(page.locator('[data-testid="connect-button"]')).toBeVisible();
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
    await expect(page.locator('[data-testid="connect-button"]')).toBeVisible();
    await expect(page.locator('text=1').first()).toBeVisible();
    await expect(page.locator('text=2').first()).toBeVisible();
    await expect(page.locator('text=3').first()).toBeVisible();
    await expect(page.locator('text=4').first()).toBeVisible();
  });
});

test.describe('UploadCSV component E2E', () => {
  test('UploadCSV component is visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="admin-page"]', { timeout: 10000 });

    // Verify UploadCSV component is rendered
    const uploadCSV = page.locator('[data-testid="upload-csv"]');
    await expect(uploadCSV).toBeVisible();

    // Verify drop zone text
    await expect(uploadCSV).toContainText('Drag & drop CSV file here');

    // Screenshot for visual regression
    await page.screenshot({
      path: 'tests/e2e/screenshots/upload-csv-initial.png',
      fullPage: false,
    });
  });

  test('UploadCSV component renders within Upload Recipients step', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="admin-page"]', { timeout: 10000 });

    // Find the Upload Recipients step section
    const uploadRecipientsSection = page.locator('section', {
      has: page.locator('h2', { hasText: 'Upload Recipients' }),
    });
    await expect(uploadRecipientsSection).toBeVisible();

    // Verify UploadCSV is inside the Upload Recipients section
    const uploadCSVInSection = uploadRecipientsSection.locator('[data-testid="upload-csv"]');
    await expect(uploadCSVInSection).toBeVisible();

    // Verify the step number "1" appears in the section
    await expect(uploadRecipientsSection.locator('text=1').first()).toBeVisible();

    // Verify the Upload CSV heading is present
    await expect(uploadRecipientsSection.locator('h3', { hasText: 'Upload CSV' })).toBeVisible();
  });

  test('UploadCSV drop zone has correct styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="admin-page"]', { timeout: 10000 });

    const uploadCSV = page.locator('[data-testid="upload-csv"]');
    await expect(uploadCSV).toBeVisible();

    // Verify the drop zone area is visible using data-testid
    const dropZone = uploadCSV.locator('[data-testid="drop-zone"]');
    await expect(dropZone).toBeVisible();

    // Check that the component has the expected dark background
    const bgColor = await uploadCSV.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.backgroundColor;
    });
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('UploadCSV file upload and table display', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="admin-page"]', { timeout: 10000 });

    const uploadCSV = page.locator('[data-testid="upload-csv"]');
    await expect(uploadCSV).toBeVisible();

    // Create a test CSV file with valid data
    const csvContent = 'address,amount\n7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,100\n7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,200';
    
    // Use the file input to upload the CSV
    const fileInput = uploadCSV.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles({
      name: 'test-recipients.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    // Wait for the table to appear
    await expect(uploadCSV.locator('table')).toBeVisible({ timeout: 5000 });

    // Verify table headers
    await expect(uploadCSV.locator('th', { hasText: 'Address' })).toBeVisible();
    await expect(uploadCSV.locator('th', { hasText: 'Amount (USDC)' })).toBeVisible();

    // Verify total is displayed
    const totalCell = uploadCSV.locator('[data-testid="csv-total"]');
    await expect(totalCell).toBeVisible();
    await expect(totalCell).toContainText('USDC');

    // Verify file name is shown
    await expect(uploadCSV).toContainText('test-recipients.csv');

    // Verify clear button is present
    const clearButton = uploadCSV.locator('[data-testid="clear-file"]');
    await expect(clearButton).toBeVisible();

    // Screenshot after upload
    await page.screenshot({
      path: 'tests/e2e/screenshots/upload-csv-with-data.png',
      fullPage: false,
    });
  });

  test('UploadCSV handles invalid CSV file', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="admin-page"]', { timeout: 10000 });

    const uploadCSV = page.locator('[data-testid="upload-csv"]');
    await expect(uploadCSV).toBeVisible();

    // Upload a non-CSV file
    const fileInput = uploadCSV.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not a csv file'),
    });

    // Verify error message is shown
    const errorMessage = uploadCSV.locator('[data-testid="csv-error"]');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    await expect(errorMessage).toContainText('Please upload a valid CSV file');

    // Screenshot with error
    await page.screenshot({
      path: 'tests/e2e/screenshots/upload-csv-error.png',
      fullPage: false,
    });
  });

  test('UploadCSV clear button removes file and table', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="admin-page"]', { timeout: 10000 });

    const uploadCSV = page.locator('[data-testid="upload-csv"]');
    await expect(uploadCSV).toBeVisible();

    // Upload a valid CSV first
    const csvContent = 'address,amount\n7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,100';
    const fileInput = uploadCSV.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles({
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    // Wait for table to appear
    await expect(uploadCSV.locator('table')).toBeVisible({ timeout: 5000 });

    // Click clear button
    const clearButton = uploadCSV.locator('[data-testid="clear-file"]');
    await clearButton.click();

    // Verify table is gone and drop zone is back
    await expect(uploadCSV.locator('table')).not.toBeVisible();
    await expect(uploadCSV.locator('[data-testid="drop-zone"]')).toBeVisible();
    await expect(uploadCSV).toContainText('Drag & drop CSV file here');
  });

  test('UploadCSV is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="admin-page"]', { timeout: 10000 });

    const uploadCSV = page.locator('[data-testid="upload-csv"]');
    await expect(uploadCSV).toBeVisible();

    // Verify text is still visible on mobile
    await expect(uploadCSV).toContainText('Drag & drop CSV file here');
    await expect(uploadCSV).toContainText('Upload CSV');

    // Screenshot for mobile visual regression
    await page.screenshot({
      path: 'tests/e2e/screenshots/upload-csv-mobile.png',
      fullPage: false,
    });
  });
});
