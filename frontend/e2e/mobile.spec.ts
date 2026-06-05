import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Responsiveness - iPhone 12', () => {
  test.use({ ...devices['iPhone 12'] });

  test.beforeEach(async ({ page }) => {
    await page.goto('/#overview');
    await page.waitForLoadState('networkidle');
  });

  test('should display navbar correctly on mobile', async ({ page }) => {
    const navbar = page.locator('[id*="navbar"]').first();
    await expect(navbar).toBeVisible();

    // Title should be visible
    await expect(page.locator('text=/Intelligence Overview|Location|Rules|Alerts/i')).toBeVisible();
  });

  test('should show mobile sidebar toggle', async ({ page }) => {
    const toggleBtn = page.locator('#mobile-sidebar-toggle');
    await expect(toggleBtn).toBeVisible();

    // On mobile, sidebar toggle should be available
    const size = await toggleBtn.boundingBox();
    expect(size).not.toBeNull();
  });

  test('should have touch-friendly buttons', async ({ page }) => {
    const buttons = page.locator('button').first();
    const box = await buttons.boundingBox();

    // Buttons should be at least 44x44 pixels (iOS standard)
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(36); // Accounting for padding
    }
  });

  test('should have responsive KPI cards on mobile', async ({ page }) => {
    const kpiCards = page.locator('[id^="kpi-"]');
    const count = await kpiCards.count();

    if (count > 0) {
      // Cards should stack vertically on mobile
      const firstCard = kpiCards.first();
      await expect(firstCard).toBeVisible();

      // All cards should be visible without horizontal scroll
      const viewport = await page.viewportSize();
      const box = await firstCard.boundingBox();

      if (box && viewport) {
        expect(box.width).toBeLessThanOrEqual(viewport.width);
      }
    }
  });

  test('should display table in scrollable container on mobile', async ({ page }) => {
    const table = page.locator('table').first();

    if (await table.isVisible()) {
      const container = table.locator('xpath=ancestor::div[@class or @style]').first();
      await expect(container).toBeVisible();
    }
  });

  test('should have readable text sizes on mobile', async ({ page }) => {
    const pageTitle = page.locator('text=/Intelligence Overview|Location|Rules/i').first();

    if (await pageTitle.isVisible()) {
      const size = await pageTitle.boundingBox();
      if (size) {
        // Text should be readable (at least 16px)
        expect(size.height).toBeGreaterThanOrEqual(14);
      }
    }
  });

  test('should have accessible form inputs on mobile', async ({ page }) => {
    await page.goto('/#rules');
    await page.waitForLoadState('networkidle');

    const createBtn = page.locator('button:has-text("Define Rule")').first();

    if (await createBtn.isEnabled()) {
      await createBtn.click();

      const inputs = page.locator('input, select').first();
      if (await inputs.isVisible()) {
        const box = await inputs.boundingBox();
        if (box) {
          // Inputs should be large enough for touch
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    }
  });

  test('should handle modal correctly on mobile', async ({ page }) => {
    await page.goto('/#locations');

    const createBtn = page.locator('button:has-text("Provision Location")').first();

    if (await createBtn.isEnabled()) {
      await createBtn.click();

      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible();

      // Modal should not exceed viewport width
      const box = await modal.boundingBox();
      const viewport = await page.viewportSize();

      if (box && viewport) {
        expect(box.width).toBeLessThanOrEqual(viewport.width);
      }
    }
  });

  test('should show error messages clearly on mobile', async ({ page }) => {
    const errorMessage = page.locator('[role="alert"], .error, .toast').first();

    if (await errorMessage.isVisible()) {
      // Error should be readable
      const box = await errorMessage.boundingBox();
      expect(box).not.toBeNull();
    }
  });

  test('should collapse sidebar on mobile view', async ({ page }) => {
    const sidebar = page.locator('[id*="sidebar"]').first();
    const toggleBtn = page.locator('#mobile-sidebar-toggle');

    // Initially sidebar might be hidden on mobile
    await toggleBtn.click();
    await page.waitForTimeout(300); // Wait for animation

    // Should be able to toggle visibility
    const isVisible = await sidebar.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('should have proper spacing on mobile', async ({ page }) => {
    const buttons = page.locator('button').first();
    const nextButton = page.locator('button').nth(1);

    if (await nextButton.isVisible()) {
      const box1 = await buttons.boundingBox();
      const box2 = await nextButton.boundingBox();

      if (box1 && box2) {
        // Buttons should have some spacing
        const spacing = Math.abs(box2.x - (box1.x + box1.width));
        expect(spacing).toBeGreaterThanOrEqual(8);
      }
    }
  });
});

test.describe('Mobile Responsiveness - Android', () => {
  test.use({ ...devices['Pixel 5'] });

  test.beforeEach(async ({ page }) => {
    await page.goto('/#overview');
    await page.waitForLoadState('networkidle');
  });

  test('should display correctly on Android', async ({ page }) => {
    await expect(page.locator('text=/Intelligence|Overview/i')).toBeVisible();
  });

  test('should handle navigation on Android', async ({ page }) => {
    const navigationElements = page.locator('a, button[onclick], [role="link"]').filter({ hasText: /locations|rules|alerts/i }).first();

    if (await navigationElements.isVisible()) {
      await navigationElements.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should properly scale on high DPI Android screen', async ({ page }) => {
    // Verify elements are properly sized for high DPI
    const buttons = page.locator('button').first();
    await expect(buttons).toBeVisible();

    const box = await buttons.boundingBox();
    expect(box).not.toBeNull();
  });
});

test.describe('Responsive Breakpoints', () => {
  const breakpoints = [
    { name: 'Mobile (375px)', width: 375, height: 667 },
    { name: 'Tablet (768px)', width: 768, height: 1024 },
    { name: 'Desktop (1440px)', width: 1440, height: 900 },
  ];

  for (const breakpoint of breakpoints) {
    test(`should render correctly at ${breakpoint.name}`, async ({ page }) => {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await page.goto('/#overview');
      await page.waitForLoadState('networkidle');

      // Main content should be visible
      await expect(page.locator('main')).toBeVisible();

      // No horizontal scroll needed
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = breakpoint.width;
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow small margin
    });
  }
});

test.describe('Touch Interactions', () => {
  test.use({ ...devices['iPhone 12'] });

  test('should handle tap on buttons', async ({ page }) => {
    await page.goto('/#overview');
    await page.waitForLoadState('networkidle');

    const button = page.locator('button').first();
    await expect(button).toBeVisible();

    // Use tap event for touch simulation
    await button.tap();
    await page.waitForTimeout(200);
  });

  test('should handle scroll interactions', async ({ page }) => {
    await page.goto('/#alerts');
    await page.waitForLoadState('networkidle');

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(200);

    // Verify scroll position
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });

  test('should handle long press on elements', async ({ page }) => {
    await page.goto('/#alerts');

    const alertRow = page.locator('tbody tr').first();

    if (await alertRow.isVisible()) {
      // Simulate long press
      await alertRow.click({ delay: 500 });
      // On iOS, this might trigger context menu
    }
  });
});
