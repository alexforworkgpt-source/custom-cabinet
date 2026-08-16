import { defineConfig, devices } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const baseURL = 'http://localhost:4173';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: join(tmpdir(), 'custom-cabinet-playwright-results'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'line',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile-320',
      grepInvert: /@desktop-flow|@telegram-flow/,
      use: { ...devices['Pixel 5'], viewport: { width: 320, height: 720 } },
    },
    {
      name: 'mobile-375',
      grepInvert: /@desktop-flow|@critical-flow/,
      use: { ...devices['Pixel 5'], viewport: { width: 375, height: 812 } },
    },
    {
      name: 'tablet-768',
      grepInvert: /@desktop-flow|@telegram-flow|@critical-flow/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 900 } },
    },
    {
      name: 'desktop-1024',
      grepInvert: /@desktop-flow|@telegram-flow|@critical-flow/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } },
    },
    {
      name: 'desktop-1280',
      grepInvert: /@telegram-flow/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --host localhost --port 4173 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
