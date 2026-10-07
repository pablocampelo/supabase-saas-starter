import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function assertNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

async function audit(page: Page) {
  await assertNoHorizontalOverflow(page);
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual([]);
}

test("public surfaces are indexable while auth and app surfaces stay private", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));

  for (const route of ["/", "/help", "/terms", "/privacy"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
    await assertNoHorizontalOverflow(page);
  }

  await page.goto("/");
  await audit(page);

  for (const route of ["/login", "/signup", "/verify-email", "/forgot-password", "/reset-password", "/auth/error", "/app", "/app/example", "/app/billing", "/app/account", "/app/help"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
    await assertNoHorizontalOverflow(page);
  }

  await page.goto("/app");
  await audit(page);
  expect(errors).toEqual([]);

  await page.goto("/example");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page isn’t here.");
});

test("social cards use the sign up preview", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/opengraph-image/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", /\/twitter-image/);

  for (const route of ["/opengraph-image", "/twitter-image"]) {
    const response = await page.request.get(route);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/png");
  }
});

test("robots and sitemap expose only supported public surfaces", async ({ page }) => {
  const robots = await (await page.request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /app");
  expect(robots).toContain("Disallow: /login");
  expect(robots).toContain("Sitemap: http://127.0.0.1:3100/sitemap.xml");

  const sitemap = await (await page.request.get("/sitemap.xml")).text();
  for (const path of ["/help", "/terms", "/privacy"]) expect(sitemap).toContain(`http://127.0.0.1:3100${path}`);
  expect(sitemap).not.toContain("/app");
  expect(sitemap).not.toContain("/login");
});

test("supported auth choices and redirect boundaries are explicit", async ({ page }) => {
  await page.goto("/login?next=https://example.com");
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /magic link/i })).toHaveCount(0);
  await expect(page.locator("[data-preview-notice]")).toContainText("Integration preview");

  await page.getByLabel("Email", { exact: true }).fill("demo@example.com");
  await page.getByLabel("Password", { exact: true }).fill("preview-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("No session was created");
  await expect(page.getByRole("link", { name: "Open the app" })).toHaveAttribute("href", "/app");

  await page.goto("/signup");
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /magic link/i })).toHaveCount(0);

  await page.goto("/forgot-password");
  await expect(page.getByRole("button", { name: "Continue with Google" })).toHaveCount(0);
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  await audit(page);
});

test("Example Resource controls follow Free, Pro, and retained-data semantics", async ({ page }) => {
  await page.goto("/app/example");
  await expect(page.getByRole("link", { name: "New resource" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "View Pro" })).toBeVisible();

  await page.goto("/app/example?scenario=retained");
  await expect(page.getByRole("link", { name: "New resource" })).toHaveCount(0);
  await page.getByRole("link", { name: /Make this space your own/ }).click();
  await expect(page.getByRole("heading", { name: "Read resource" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save resource" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Upgrade to edit" })).toBeVisible();

  const deleteTrigger = page.getByRole("button", { name: "Delete Make this space your own" });
  await deleteTrigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(deleteTrigger).toBeFocused();
  await deleteTrigger.click();
  await page.getByRole("button", { name: "Delete resource", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("was not deleted");

  await page.goto("/app/example/first-example?scenario=pro-monthly");
  await expect(page.getByRole("heading", { name: "Edit resource" })).toBeVisible();
  await page.getByLabel("Title", { exact: true }).fill("Unsaved local draft");
  await page.getByRole("button", { name: "Save resource" }).click();
  await expect(page.getByRole("status")).toContainText("not saved");
  await page.reload();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue("Make this space your own");
  await audit(page);
});

test("billing states preserve paid-through and no-browser-authority semantics", async ({ page }) => {
  for (const scenario of ["free", "pro-monthly", "pro-annual", "confirming", "past-due", "canceling", "expired", "failed"] as const) {
    await page.goto(`/app/billing?scenario=${scenario}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Billing");
    const hasCurrentSubscription = ["pro-monthly", "pro-annual", "confirming", "past-due", "canceling"].includes(scenario);
    await expect(page.getByRole("group", { name: "Billing interval" })).toHaveCount(hasCurrentSubscription ? 0 : 1);
    await expect(page.getByRole("button", { name: hasCurrentSubscription ? "Manage subscription" : "Continue to Checkout", exact: true })).toBeVisible();
    if (scenario === "confirming") await expect(page.getByText("No Pro access has been granted.", { exact: false })).toBeVisible();
    if (scenario === "past-due") await expect(page.getByText("Previously paid through", { exact: false })).toBeVisible();
    if (scenario === "canceling") await expect(page.getByText("Paid through", { exact: false })).toBeVisible();
    if (scenario === "failed") await expect(page.getByRole("alert").filter({ hasText: "Payment was not confirmed" })).toContainText("no Pro access was granted");
    await assertNoHorizontalOverflow(page);
  }

  await page.goto("/app/billing?scenario=failed");
  await audit(page);
});

test("app shell contains real product surfaces without fake business KPIs", async ({ page }, info) => {
  await page.goto("/app?scenario=pro-monthly");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("main")).not.toContainText(/MRR|ARR|Active users|Conversion rate|Revenue chart/i);
  await expect(page.getByText("Your product starts here", { exact: true })).toBeVisible();
  await expect(page.locator("[data-preview-notice]")).toContainText("Sample account data only");

  if (info.project.name === "chromium-360") {
    const trigger = page.getByRole("button", { name: "Open navigation" });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  }
  await audit(page);
});

test("200 percent zoom reflow retains core controls", async ({ page }) => {
  const viewport = page.viewportSize()!;
  await page.setViewportSize({ width: Math.floor(viewport.width / 2), height: Math.floor(viewport.height / 2) });
  for (const route of ["/", "/login", "/app/example?scenario=pro-monthly", "/app/billing", "/app/account"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => Array.from(document.querySelectorAll("body *")).filter(element => { const rect = element.getBoundingClientRect(); return rect.width > 0 && rect.right > innerWidth + 1; }).slice(0, 15).map(element => ({ tag: element.tagName, class: element.className, text: element.textContent?.slice(0, 50) })));
    expect(overflow).toEqual([]);
  }
});
