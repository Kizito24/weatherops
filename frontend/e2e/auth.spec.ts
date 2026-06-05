import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'test@weatherops.local';
const TEST_PASSWORD = 'TestPassword123!';

test.describe('Authentication Flow', () => {
  test('should display login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Login to WeatherOps')).toBeVisible();
    await expect(page.locator('input[placeholder*="Email"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Password"]')).toBeVisible();
  });

  test('should show register link on login page', async ({ page }) => {
    await page.goto('/');
    const registerLink = page.locator('a:has-text("Create an account")');
    await expect(registerLink).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    await page.locator('a:has-text("Create an account")').click();
    await expect(page).toHaveURL(/#register/);
    await expect(page.locator('text=Create Account')).toBeVisible();
  });

  test('should validate email on login', async ({ page }) => {
    await page.goto('/');
    const submitBtn = page.locator('button:has-text("Sign In")');

    // Try submitting without email
    await submitBtn.click();
    await expect(page.locator('text=Email is required')).toBeVisible();

    // Try with invalid email
    await page.locator('input[placeholder*="Email"]').fill('invalid-email');
    await submitBtn.click();
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  test('should validate password on login', async ({ page }) => {
    await page.goto('/');
    const emailInput = page.locator('input[placeholder*="Email"]');
    const passwordInput = page.locator('input[placeholder*="Password"]');
    const submitBtn = page.locator('button:has-text("Sign In")');

    await emailInput.fill(TEST_EMAIL);
    await submitBtn.click();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show password toggle on login', async ({ page }) => {
    await page.goto('/');
    const passwordInput = page.locator('input[placeholder*="Password"]');
    const toggleBtn = page.locator('[title*="password"]');

    await passwordInput.fill('testpass');
    await expect(toggleBtn).toBeVisible();
  });
});
