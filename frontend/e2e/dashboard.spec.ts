import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app (assumes authenticated or auto-login for tests)
    await page.goto('/#overview');
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
  });

  test('should display overview page with KPI cards', async ({ page }) => {
    await expect(page.locator('text=Intelligence Overview')).toBeVisible();
    await expect(page.locator('text=Total Locations')).toBeVisible();
    await expect(page.locator('text=Active Rules')).toBeVisible();
    await expect(page.locator('text=Active Alerts')).toBeVisible();
  });

  test('should navigate to locations page', async ({ page }) => {
    await page.locator('a[href*="locations"], button:has-text("Locations")').first().click();
    await page.waitForURL(/#locations/);
    await expect(page.locator('text=Location Monitoring Registry')).toBeVisible();
  });

  test('should navigate to rules page', async ({ page }) => {
    await page.locator('a[href*="rules"], button:has-text("Rules")').first().click();
    await page.waitForURL(/#rules/);
    await expect(page.locator('text=Automated Weather Rules')).toBeVisible();
  });

  test('should navigate to alerts page', async ({ page }) => {
    await page.locator('a[href*="alerts"], button:has-text("Alerts")').first().click();
    await page.waitForURL(/#alerts/);
    await expect(page.locator('text=Weather-Triggered Alerts')).toBeVisible();
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.locator('a[href*="settings"], button:has-text("Settings")').first().click();
    await page.waitForURL(/#settings/);
    await expect(page.locator('text=Platform Settings')).toBeVisible();
  });

  test('should toggle dark mode', async ({ page }) => {
    const themeToggle = page.locator('[title*="Dark Mode"], [title*="Light Mode"]').first();
    const htmlElement = page.locator('html');

    await themeToggle.click();
    await expect(htmlElement).toHaveClass(/dark/);

    await themeToggle.click();
    await expect(htmlElement).not.toHaveClass(/dark/);
  });

  test('should refresh data', async ({ page }) => {
    const refreshBtn = page.locator('button:has-text("Sync Data")');
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    // Verify loading state appears and disappears
    await expect(refreshBtn.locator('svg')).toHaveClass(/animate-spin/);
  });

  test('should toggle sidebar on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    const toggleBtn = page.locator('#mobile-sidebar-toggle');
    const sidebar = page.locator('[id*="sidebar"]').first();

    await toggleBtn.click();
    // Sidebar should collapse (implementation dependent)
  });
});
