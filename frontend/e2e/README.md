# WeatherOps E2E Tests with Playwright

This directory contains end-to-end tests for the WeatherOps frontend application using Playwright.

## Test Coverage

### `auth.spec.ts`
- Login/Register page display
- Form validation
- Email and password field validation
- Password visibility toggle

### `dashboard.spec.ts`
- Navigation between pages (Overview, Locations, Rules, Alerts, Settings)
- KPI card display
- Dark mode toggle
- Data refresh functionality
- Mobile responsive sidebar toggle

### `locations.spec.ts`
- Location listing and display
- Creating new locations
- Form validation (name, latitude, longitude)
- Editing locations
- Deleting locations with confirmation

### `rules.spec.ts`
- Weather rules listing
- Creating new rules
- Form validation (location, metric, operator, threshold)
- Toggling rule status (active/inactive)
- Deleting rules
- Metric icon display

### `alerts.spec.ts`
- Alerts listing and display
- Alert table columns and data
- Severity badges
- Filtering by location
- Pagination
- Deleting alerts
- Clearing all alerts

### `export.spec.ts`
- Export button in navbar
- Export modal display
- Selecting export type (Alerts/Rules)
- Selecting file format (CSV/JSON)
- Date range filtering for alerts
- Downloading exported files

## Running the Tests

### Install Dependencies

```bash
npm install --save-dev @playwright/test
```

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests in UI Mode

```bash
npm run test:e2e:ui
```

### Run Tests in Debug Mode

```bash
npm run test:e2e:debug
```

### Run Specific Test File

```bash
npx playwright test e2e/auth.spec.ts
```

### Run Tests with Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Configuration

The Playwright configuration is defined in `playwright.config.ts` and includes:

- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, Safari (Desktop and Mobile)
- **Web Server**: Automatically starts dev server on port 3000
- **Screenshots**: Captured on test failure
- **Trace**: Recorded on first retry
- **Reporter**: HTML report generated in `playwright-report/`

## Test Environment

### Prerequisites

1. Node.js and npm installed
2. Backend API server running (or mocked in test environment)
3. Frontend dev server (`npm run dev`) - automatically started by Playwright

### Environment Variables

Ensure `.env.local` in the frontend directory is properly configured:

```
VITE_API_BASE_URL=http://localhost:8000
```

## CI/CD Integration

For CI/CD pipelines:

```bash
CI=true npm run test:e2e
```

This will:
- Run in headless mode
- Retry failed tests
- Generate HTML report
- Use single worker

## Debugging Failed Tests

### View HTML Report

```bash
npx playwright show-report
```

### Debug Specific Test

```bash
npx playwright test --debug e2e/auth.spec.ts
```

### Generate Trace File

Traces are automatically captured on first retry and can be viewed in Playwright Inspector.

## Best Practices

1. **Use data-testid attributes** when possible for reliable element selection
2. **Wait for network idle** after navigation: `await page.waitForLoadState('networkidle')`
3. **Handle dynamic content** with proper waits instead of hard timeouts
4. **Skip tests gracefully** when prerequisites aren't met (e.g., no locations created)
5. **Clean up after tests** by resetting state or logging out

## Adding New Tests

When adding new tests:

1. Create a new `.spec.ts` file in the `e2e` directory
2. Import from `@playwright/test`
3. Use descriptive test names
4. Add `beforeEach` hooks to set up test state
5. Use `test.skip()` to conditionally skip tests
6. Verify both positive and negative scenarios

Example:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#feature');
    await page.waitForLoadState('networkidle');
  });

  test('should display feature', async ({ page }) => {
    await expect(page.locator('text=Feature')).toBeVisible();
  });

  test('should perform action', async ({ page }) => {
    await page.locator('button:has-text("Action")').click();
    await expect(page.locator('text=Result')).toBeVisible();
  });
});
```

## Troubleshooting

### Tests timeout waiting for server

- Increase `webServer.timeout` in `playwright.config.ts`
- Ensure dev server is running and accessible on `localhost:3000`

### Element not found

- Use `--debug` mode to inspect element selectors
- Check if element is visible/enabled before interaction
- Wait for network activity to complete

### Flaky tests

- Avoid hard timeouts (`setTimeout`)
- Use proper waitFor methods
- Check for race conditions in async code
- Consider test isolation and cleanup
