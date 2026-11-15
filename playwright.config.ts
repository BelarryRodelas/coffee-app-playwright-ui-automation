import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',

  // Every test file (and every test inside it) can run in parallel.
  // This is safe because each test gets a fresh browser context and the
  // app keeps its cart in memory, so tests never share state.
  fullyParallel: true,
  forbidOnly: isCI, // fail the build if someone commits test.only
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,

  timeout: 30_000,
  expect: { timeout: 10_000 },

  reporter: isCI
    ? [
        ['github'],
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'reports/junit.xml' }],
      ]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    // The environment URL comes from env vars, never from test code.
    baseURL: process.env.BASE_URL ?? 'https://coffee-cart.app',

    // coffee-cart marks elements with data-test="...", so getByTestId()
    // should look at that attribute instead of the default data-testid.
    testIdAttribute: 'data-test',

    actionTimeout: 10_000,
    navigationTimeout: 30_000,

    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: isCI ? 'retain-on-failure' : 'off',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // Add WebKit when you want it:
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
