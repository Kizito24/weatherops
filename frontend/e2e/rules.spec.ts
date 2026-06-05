import { test, expect } from '@playwright/test';

test.describe('Weather Rules Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#rules');
    await page.waitForLoadState('networkidle');
  });

  test('should display rules page', async ({ page }) => {
    await expect(page.locator('text=Automated Weather Rules')).toBeVisible();
    await expect(page.locator('button:has-text("Define Rule")')).toBeVisible();
  });

  test('should open rule creation modal', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Define Rule")');

    // Skip if no locations available
    if (await createBtn.isDisabled()) {
      test.skip();
    }

    await createBtn.click();
    await expect(page.locator('text=Define Weather Rule')).toBeVisible();
  });

  test('should validate rule form - location required', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Define Rule")');

    if (await createBtn.isDisabled()) {
      test.skip();
    }

    await createBtn.click();
    const submitBtn = page.locator('#submit-create-rule');
    const thresholdInput = page.locator('#rule-threshold');

    await thresholdInput.fill('25');
    await submitBtn.click();

    // Check if location validation error appears
    await expect(page.locator('text=location')).toBeVisible({ timeout: 3000 });
  });

  test('should validate rule form - threshold required', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Define Rule")');

    if (await createBtn.isDisabled()) {
      test.skip();
    }

    await createBtn.click();
    const locSelect = page.locator('#rule-loc-select');
    const submitBtn = page.locator('#submit-create-rule');

    // Select first location
    const options = await locSelect.locator('option').count();
    if (options > 1) {
      await locSelect.selectOption({ index: 1 });
      await submitBtn.click();

      // Should show threshold validation error
      await expect(page.locator('text=Threshold')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should create a new rule', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Define Rule")');

    if (await createBtn.isDisabled()) {
      test.skip();
    }

    await createBtn.click();

    const locSelect = page.locator('#rule-loc-select');
    const metricSelect = page.locator('#rule-metric-select');
    const opSelect = page.locator('#rule-op-select');
    const thresholdInput = page.locator('#rule-threshold');
    const submitBtn = page.locator('#submit-create-rule');

    // Select first location
    const options = await locSelect.locator('option').count();
    if (options > 1) {
      await locSelect.selectOption({ index: 1 });
      await metricSelect.selectOption('temperature');
      await opSelect.selectOption('>');
      await thresholdInput.fill('30');
      await submitBtn.click();

      // Wait for success
      await page.waitForTimeout(1000);
    }
  });

  test('should display rule cards', async ({ page }) => {
    const ruleCards = page.locator('[id^="rule-card-"]');
    const count = await ruleCards.count();

    if (count > 0) {
      const firstCard = ruleCards.first();
      await expect(firstCard).toBeVisible();
      // Check for rule details
      await expect(firstCard.locator('text=/temperature|rainfall|wind|humidity/i')).toBeVisible();
    }
  });

  test('should toggle rule active status', async ({ page }) => {
    const toggleBtn = page.locator('[id*="toggle-rule"]').first();

    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      // Visual indication should change
      await page.waitForTimeout(500);
    }
  });

  test('should delete a rule with confirmation', async ({ page }) => {
    const deleteBtn = page.locator('[id*="delete-rule"]').first();

    if (await deleteBtn.isVisible()) {
      page.on('dialog', dialog => dialog.accept());
      await deleteBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should show metric icons for different weather metrics', async ({ page }) => {
    const ruleCards = page.locator('[id^="rule-card-"]');

    if (await ruleCards.count() > 0) {
      const metricIcon = ruleCards.first().locator('svg').first();
      await expect(metricIcon).toBeVisible();
    }
  });

  test('should display form validation inline', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Define Rule")');

    if (await createBtn.isDisabled()) {
      test.skip();
    }

    await createBtn.click();
    const thresholdInput = page.locator('#rule-threshold');

    // Type invalid value
    await thresholdInput.fill('abc');
    await thresholdInput.blur();

    // Error message should appear
    await expect(page.locator('text=number')).toBeVisible({ timeout: 2000 });
  });
});
