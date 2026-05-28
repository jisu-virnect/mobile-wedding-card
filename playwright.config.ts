import { defineConfig, devices } from '@playwright/test'

// Default port for the preview webServer. Override with E2E_PORT=5180 to
// dodge a stale dev server occupying 5173 (see pipeline/E2E_PLAYBOOK.md
// case #9). CI always uses 5173 since the runner is a clean sandbox.
const PORT = process.env.E2E_PORT ?? '5173'
const URL = `http://127.0.0.1:${PORT}`

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
    baseURL: URL,
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
    command: `pnpm preview --port ${PORT} --host 127.0.0.1`,
    url: URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
