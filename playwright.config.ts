import { defineConfig } from "@playwright/test";
import { foundationEnv } from "./tests/fixtures/env";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  timeout: 60_000,
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  projects: [360, 768, 1280].map((width) => ({ name: `chromium-${width}`, use: { browserName: "chromium", viewport: { width, height: 900 } } })),
  webServer: {
    command: "pnpm dev --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    env: { ...foundationEnv, NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3100" },
    timeout: 120_000,
  },
});
