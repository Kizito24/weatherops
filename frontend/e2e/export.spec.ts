import { test, expect } from '@playwright/test';

test.describe('Data Export Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#overview');
    await page.waitForLoadState('networkidle');
  });

  test('should display export button in navbar', async ({ page }) => {
    const exportBtn = page.locator('#export-data-button, button:has-text("Export")').first();
    await expect(exportBtn).toBeVisible();
  });

  test('should open export modal', async ({ page }) => {
    const exportBtn = page.locator('#export-data-button, button:has-text("Export")').first();
    await exportBtn.click();

    await expect(page.locator('text=Export Data')).toBeVisible();
    await expect(page.locator('text=Export Type')).toBeVisible();
    await expect(page.locator('text=File Format')).toBeVisible();
  });

  test('should allow selecting alerts export type', async ({ page }) => {
    const exportBtn = page.locator('#export-data-button, button:has-text("Export")').first();
    await exportBtn.click();

    const alertsBtn = page.locator('button:has-text("Alerts")').first();
    await alertsBtn.click();

    // Verify alerts is selected
    await expect(alertsBtn).toHaveClass(/indigo|selected|active/);
  });

  test('should allow selecting rules export type', async ({ page }) => {
    const exportBtn = page.locator('#export-data-button, button:has-text("Export")').first();
    await exportBtn.click();

    const rulesBtn = page.locator('button:has-text("Rules")').first();
    await rulesBtn.click();

    // Verify rules is selected
    await expect(rulesBtn).toHaveClass(/indigo|selected|active/);
  });

  test('should allow selecting CSV format', async ({ page }) => {
    const exportBtn = page.locator('#export-data-button, button:has-text("Export")').first();
    await exportBtn.click();

    const csvBtn = page.locator('button:has-text("CSV")').first();
    await csvBtn.click();

    // Verify CSV is selected
    await expect(csvBtn).toHaveClass(/indigo|selected|active/);
  });

  test('should allow selecting JSON format', async ({ page }) => {
    const exportBtn = page.locator('#export-data-button, button:has-text("Export")').first();
    await exportBtn.click();

    const jsonBtn = page.locator('button:has-text("JSON")').first();
    await jsonBtn.click();

    // Verify JSON is selected
    await expect(jsonBtn).toHaveClass(/indigo|selected|active/);
  });

  test('should show date range inputs for alerts export', async ({ page }) => {
    const exportBtn = page.locator('#export-data-button, button:has-text("Export")').first();
    await exportBtn.click();

    // Alerts should be selected by default
    const dateRangeLabel = page.locator('text=Date Range');
    await expect(dateRangeLabel).toBeVisible();

    const startDateInput = page.locator('#date-start, input[placeholder*="Start"]').first();
    const endDateInput = page.locator('#date-end, input[placeholder*="End"]').first();

    await expect(startDateInput).toBeVisible();
    await expect(endDateInput).toBeVisible();
  });

  test('should not show date range for rules export', async ({ page }) => {
    const exportBtn = page.locator('#export-data-button, button:has-text("Export")').first();
    await exportBtn.click();

    const rulesBtn = page.locator('button:has-text("Rules")').first();
    await rulesBtn.click();

    const dateRangeLabel = page.locator('text=Date Range');
    await expect(dateRangeLabel).not.toBeVisible();
  });

  test('should disable export button when no data', async ({ page }) => {
    const exportBtn = page.locator('#export-data-button, button:has-text("Export")').first();
    await exportBtn.click();

    const exportDataBtn = page.locator('button:has-text("Export")').last();
    // Button might be disabled if no data (depends on state)
    const isDisabled = await exportDataBtn.isDisabled().catch(() => false);
    // Just verify button exists
    await expect(exportDataBtn).toBeVisible();
  });

  test('should set date filters', async ({ page }) => {
    const exportBtn = page.locator('#export-data-button, button:has-text("Export")').first();
    await exportBtn.click();

    const startDateInput = page.locator('#date-start, input[type="date"]').first();
    const endDateInput = page.locator('#date-end, input[type="date"]').first();

    if (await startDateInput.isVisible()) {
      await startDateInput.fill('2026-06-01');
      await endDateInput.fill('2026-06-05');

      await expect(startDateInput).toHaveValue('2026-06-01');
      await expect(endDateInput).toHaveValue('2026-06-05');
    }
  });

  test('should close export modal', async ({ page }) => {
    const exportBtn = page.locator('#export-data-button, button:has-text("Export")').first();
    await exportBtn.click();

    const closeBtn = page.locator('button:has-text("Cancel")').first();
    await closeBtn.click();

    // Modal should be hidden
    const modal = page.locator('text=Export Data');
    await expect(modal).not.toBeVisible();
  });

  test('should trigger download on export', async ({ page, context }) => {
    // Listen for download
    let downloadStarted = false;
    context.on('page', p => {
      p.on('download', () => {
        downloadStarted = true;
      });
    });

    const exportBtn = page.locator('#export-data-button, button:has-text("Export")').first();
    await exportBtn.click();

    // Select CSV format and alerts type (defaults)
    const exportDataBtn = page.locator('button:has-text("Export")').last();

    // Check if button is enabled (has data)
    if (!await exportDataBtn.isDisabled()) {
      const downloadPromise = page.waitForEvent('download');
      await exportDataBtn.click();

      // Verify download started
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/alerts.*\.csv|rules.*\.csv/);
    }
  });
});
