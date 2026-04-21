import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // CI is single-worker for determinism; locally we cap at 4 because
  // screenshot: 'on' adds enough overhead that high concurrency becomes
  // the flake source.
  workers: process.env.CI ? 1 : 4,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    // Always capture an end-of-test screenshot (success + failure) so we can
    // browse success frames alongside failures in the HTML report/artifacts.
    screenshot: 'on',
    // Keep video + trace only for failures to avoid artifact bloat.
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile-chromium-iphone',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
    {
      name: 'mobile-chromium-galaxy',
      use: { ...devices['Galaxy S9+'] },
    },
  ],
  webServer: {
    command: 'pnpm preview --port 5173 --host 127.0.0.1',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
