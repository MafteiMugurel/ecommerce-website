import { defineConfig, devices } from '@playwright/test'

/**
 * Teste end-to-end (Playwright).
 * Pornesc automat serverul de dezvoltare Vite și rulează pe datele reale din Firestore.
 * Testele doar CITESC date (catalog, recenzii); nu plasează comenzi și nu scriu recenzii,
 * ca să nu polueze baza de date. Vezi docs/testing.md.
 */
const PORT = 5173
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: /responsive.spec.ts/ },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] }, testMatch: /responsive\.spec\.ts/ },
  ],
  // Pornește `npm run dev` doar când testăm local (nu când E2E_BASE_URL indică site-ul publicat)
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run dev -- --port 5173 --strictPort',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
})
