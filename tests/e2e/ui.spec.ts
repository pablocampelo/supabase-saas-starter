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

test("public navigation has no obsolete sections or broken anchors", async ({ page }) => {
  await page.goto("/");

  for (const label of ["From clone to product", "What’s included", "Start building"]) {
    await expect(page.getByText(label, { exact: true })).toHaveCount(0);
  }

  const header = page.locator('nav[aria-label="Main navigation"]');
  const footer = page.getByRole("navigation", { name: "Product" });
  for (const [label, hash] of [["Pricing", "#pricing"], ["FAQ", "#faq"]] as const) {
    await expect(header.locator("a").filter({ hasText: label })).toHaveAttribute("href", `/${hash}`);
    await expect(footer.getByRole("link", { name: label })).toHaveAttribute("href", `/${hash}`);
    await expect(page.locator(hash)).toHaveCount(1);
  }

  await expect(page.locator('a[href="/#features"]')).toHaveCount(0);
  await expect(page.locator("#features")).toHaveCount(0);
});

test("public footer is logo-only and header separates navigation from account actions", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer.locator(".brand")).toHaveCount(1);
  await expect(footer).not.toContainText("Build the product. Not the infrastructure.");
  await expect(footer).not.toContainText("Next.js · Supabase · Stripe");
  const header = page.locator('nav[aria-label="Main navigation"]');
  await expect(header.locator('a[href="/login"]')).toHaveAttribute("href", "/login");
  await expect(header.locator('a[href="/signup"]')).toHaveAttribute("href", "/signup");
  await expect(header.locator('a[href="/login"]')).toHaveText("Log in");
});

test("landing sections use consistent subtle white horizontal separators", async ({ page }) => {
  await page.goto("/");
  for (const selector of ["header", "#pricing", "#faq", "footer"]) {
    const edge = selector === "header" ? "border-b" : "border-t";
    await expect(page.locator(selector)).toHaveClass(new RegExp(`\\b${edge}\\b`));
    await expect(page.locator(selector)).toHaveClass(/border-white/);
  }
  await expect(page.locator("#faq .divide-y, #faq .border-y")).toHaveCount(0);
});

test("Google authentication buttons display the multicolor brand mark", async ({ page }) => {
  for (const route of ["/login", "/signup"]) {
    await page.goto(route);
    const button = page.locator("button, a").filter({ hasText: "Continue with Google" });
    await expect(button.locator("svg path")).toHaveCount(4);
    for (const color of ["#EA4335", "#4285F4", "#FBBC05", "#34A853"]) {
      await expect(button.locator(`svg path[fill="${color}"]`)).toHaveCount(1);
    }
  }
});

test("dark visual system stays consistent on public, auth and app surfaces", async ({ page }) => {
  for (const route of ["/", "/signup", "/login", "/app", "/app/billing", "/app/account"]) {
    await page.goto(route);
    const theme = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const body = getComputedStyle(document.body);
      return { scheme: root.colorScheme, background: body.backgroundColor, action: root.getPropertyValue("--primary").trim() };
    });
    expect(theme.scheme).toBe("dark");
    expect(theme.background).toBe("rgb(8, 9, 10)");
    expect(["#fff", "#ffffff"]).toContain(theme.action);
    await assertNoHorizontalOverflow(page);
  }
});

test("primary CTAs use white pill buttons while the popular badge owns lime", async ({ page }) => {
  await page.goto("/");
  const cta = page.getByRole("link", { name: "View on GitHub", exact: true });
  await expect(cta).toHaveAttribute("href", "https://github.com/pablocampelo/xerv");
  await expect(cta).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(cta).toHaveCSS("color", "rgb(8, 9, 10)");
  await expect(cta).toHaveClass(/rounded-full/);
  const popular = page.getByText("MOST POPULAR", { exact: true });
  await expect(popular).toHaveCSS("background-color", "rgb(228, 242, 34)");
  await expect(popular).toHaveCSS("color", "rgb(8, 9, 10)");
});

test("social cards use the current Xerv branding", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/opengraph-image/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", /\/opengraph-image/);
  await expect(page.getByText("MOST POPULAR", { exact: true })).toBeVisible();

  const response = await page.request.get("/opengraph-image");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("image/png");
  const image = await response.body();
  expect(image.subarray(1, 4).toString()).toBe("PNG");
  expect(image.readUInt32BE(16)).toBe(1280);
  expect(image.readUInt32BE(20)).toBe(640);
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute("content");
  expect(ogImage).toBe(twitterImage);
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", /Xerv/);
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

test("signup fits entirely into a standard viewport", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  for (const field of ["Name", "Email", "Password"]) await expect(page.getByLabel(field, { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  await expect(page.getByText("By creating an account", { exact: false })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
});



test("the Split X identity is consistent across header, footer, auth and favicon", async ({ page, request }) => {
  await page.goto("/");
  const header = page.locator("header .brand");
  const footer = page.locator("footer .brand");
  await expect(header).toContainText("Xerv");
  await expect(footer).not.toContainText("Xerv");
  await expect(header.locator('img[src="/icon.svg"]')).toHaveCount(1);
  await expect(footer.locator('img[src="/icon.svg"]')).toHaveCount(1);
  await expect(header.locator("span")).toHaveCSS("font-size", "20px");

  const icon = await request.get("/icon.svg");
  expect(icon.ok()).toBe(true);
  const source = await icon.text();
  expect(source).toContain("#e4f222");
  expect(source).toContain("Xerv Split X");

  await page.goto("/signup");
  await expect(page.locator('img[src="/icon.svg"]')).toHaveCount(1);
});


test("responsive matrix keeps key screens usable from narrow phones to wide desktops", async ({ page }) => {
  const viewportWidths = [320, 390, 820, 1024, 1920];
  const routes = ["/", "/signup", "/app", "/app/billing", "/app/example"];
  for (const width of viewportWidths) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await assertNoHorizontalOverflow(page);
      const main = page.locator("main").first();
      const rect = await main.boundingBox();
      expect(rect).not.toBeNull();
      expect(rect!.x).toBeGreaterThanOrEqual(-1);
      expect(rect!.x + rect!.width).toBeLessThanOrEqual(width + 1);
    }
    await page.goto("/");
    const mobile = width < 1024;
    const trigger = page.getByRole("button", { name: "Open navigation" });
    if (mobile) {
      await expect(trigger).toBeVisible();
      await trigger.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Log in" })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).not.toBeVisible();
    } else {
      await expect(trigger).toBeHidden();
      await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Log in" })).toBeVisible();
    }
  }
});

