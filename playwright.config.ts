import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir:       './tests',
  fullyParallel:  true,
  retries:        1,
  workers:        2,
  timeout:        60000,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL:           'https://practicesoftwaretesting.com',
    headless:          true,
    screenshot:        'only-on-failure',
    video:             'on-first-retry',
    trace:             'on-first-retry',
    actionTimeout:     15000,
    navigationTimeout: 30000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  outputDir: 'test-results/',
});
