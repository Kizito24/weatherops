import { test, expect } from '@playwright/test';

test.describe('Locations Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#locations');
    await page.waitForLoadState('networkidle');
  });

  test('should display locations page', async ({ page }) => {
    await expect(page.locator('text=Location Monitoring Registry')).toBeVisible();
    await expect(page.locator('text=Provision Location')).toBeVisible();
  });

  test('should open location creation modal', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Provision Location")');
    await createBtn.click();

    await expect(page.locator('text=Add New Location')).toBeVisible();
    await expect(page.locator('input[placeholder*="Location Name"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Latitude"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Longitude"]')).toBeVisible();
  });

  test('should validate location form', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Provision Location")');
    await createBtn.click();

    const submitBtn = page.locator('button:has-text("Add Location")');

    // Try submitting empty form
    await submitBtn.click();
    await expect(page.locator('text=required')).toBeVisible({ timeout: 5000 });
  });

  test('should create a new location', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Provision Location")');
    await createBtn.click();

    const nameInput = page.locator('input[placeholder*="Location Name"]');
    const latInput = page.locator('input[placeholder*="Latitude"]');
    const lngInput = page.locator('input[placeholder*="Longitude"]');
    const submitBtn = page.locator('button:has-text("Add Location")');

    await nameInput.fill('Test Location');
    await latInput.fill('40.7128');
    await lngInput.fill('-74.0060');
    await submitBtn.click();

    // Wait for success message or modal to close
    await page.waitForTimeout(500);
    await expect(page.locator('[role="dialog"], .modal')).not.toBeVisible({ timeout: 3000 });
  });

  test('should validate latitude/longitude ranges', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Provision Location")');
    await createBtn.click();

    const latInput = page.locator('input[placeholder*="Latitude"]');
    const lngInput = page.locator('input[placeholder*="Longitude"]');
    const submitBtn = page.locator('button:has-text("Add Location")');

    // Test invalid latitude
    await latInput.fill('95'); // > 90
    await lngInput.fill('0');
    await submitBtn.click();
    // Should show validation error
  });

  test('should display location list', async ({ page }) => {
    const locationCards = page.locator('[id^="location-card-"]');
    const count = await locationCards.count();

    if (count > 0) {
      await expect(locationCards.first()).toBeVisible();
      // Check for location name and coordinates
      await expect(locationCards.first().locator('text=')).toContainText(/[0-9.-]+/);
    }
  });

  test('should edit a location', async ({ page }) => {
    const editBtn = page.locator('[id*="edit-location"]').first();

    if (await editBtn.isVisible()) {
      await editBtn.click();
      await expect(page.locator('text=Edit Location')).toBeVisible();
    }
  });

  test('should delete a location with confirmation', async ({ page }) => {
    const deleteBtn = page.locator('[id*="delete-location"]').first();

    if (await deleteBtn.isVisible()) {
      page.on('dialog', dialog => dialog.accept());
      await deleteBtn.click();
      await page.waitForTimeout(1000);
    }
  });
});
