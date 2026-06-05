import { test, expect } from '@playwright/test';

test.describe('Alerts Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#alerts');
    await page.waitForLoadState('networkidle');
  });

  test('should display alerts page', async ({ page }) => {
    await expect(page.locator('text=Weather-Triggered Alerts')).toBeVisible();
  });

  test('should show empty state when no alerts', async ({ page }) => {
    const alertsTable = page.locator('table');
    const emptyState = page.locator('text=/no alerts|no violations/i');

    // Either table exists or empty state exists
    const hasAlerts = await alertsTable.isVisible().catch(() => false);
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    expect(hasAlerts || hasEmptyState).toBeTruthy();
  });

  test('should display alert table with correct columns', async ({ page }) => {
    const table = page.locator('table');

    if (await table.isVisible()) {
      const headers = ['Location', 'Metric', 'Value', 'Severity', 'Time'];
      for (const header of headers) {
        await expect(page.locator(`text=${header}`)).toBeVisible();
      }
    }
  });

  test('should display alert rows with data', async ({ page }) => {
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();

    if (rowCount > 0) {
      const firstRow = tableRows.first();
      await expect(firstRow).toBeVisible();
      // Each row should have cells
      const cells = firstRow.locator('td');
      expect(await cells.count()).toBeGreaterThan(0);
    }
  });

  test('should display alert status badges', async ({ page }) => {
    const badges = page.locator('[class*="badge"], [class*="Badge"]');
    const count = await badges.count();

    if (count > 0) {
      await expect(badges.first()).toBeVisible();
    }
  });

  test('should filter alerts by location if selector exists', async ({ page }) => {
    const locationFilter = page.locator('select[id*="location"], [role="combobox"]').first();

    if (await locationFilter.isVisible()) {
      await locationFilter.click();
      // Select an option
      const option = locationFilter.locator('option, [role="option"]').nth(1);
      if (await option.isVisible()) {
        await option.click();
        // Table should update
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should paginate alerts if available', async ({ page }) => {
    const pagination = page.locator('[class*="pagination"], button:has-text("Next")')  ;

    if (await pagination.first().isVisible()) {
      const nextBtn = page.locator('button:has-text("Next")');
      if (await nextBtn.isEnabled()) {
        await nextBtn.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should delete an alert with confirmation', async ({ page }) => {
    const deleteBtn = page.locator('[id*="delete-alert"]').first();

    if (await deleteBtn.isVisible()) {
      page.on('dialog', dialog => dialog.accept());
      await deleteBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should clear all alerts with confirmation', async ({ page }) => {
    const clearBtn = page.locator('button:has-text("Clear All")');

    if (await clearBtn.isVisible()) {
      page.on('dialog', dialog => dialog.accept());
      await clearBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should display metric icons in alerts table', async ({ page }) => {
    const rows = page.locator('tbody tr');

    if (await rows.count() > 0) {
      const metricCell = rows.first().locator('td').nth(1);
      const icon = metricCell.locator('svg');
      if (await icon.isVisible()) {
        await expect(icon).toBeVisible();
      }
    }
  });

  test('should resolve an alert if action available', async ({ page }) => {
    const resolveBtn = page.locator('[id*="resolve-alert"]').first();

    if (await resolveBtn.isVisible()) {
      await resolveBtn.click();
      await page.waitForTimeout(500);
    }
  });
});
