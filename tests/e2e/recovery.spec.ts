import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("recovery uses the login shell and predictable exits", async ({ page }) => {
  const sharedLayout: Array<{ width: number; logo: number; heading: number }> = [];
  for (const route of ["/login", "/forgot-password"]) {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    sharedLayout.push(await page.locator("main").evaluate(main => {
      const heading = main.querySelector("h1")!;
      const copy = heading.nextElementSibling!;
      const logo = main.querySelector("img")!;
      const form = main.querySelector("form")!;
      return {
        width: form.getBoundingClientRect().width,
        logo: heading.getBoundingClientRect().top - logo.getBoundingClientRect().bottom,
        heading: copy.getBoundingClientRect().top - heading.getBoundingClientRect().bottom,
      };
    }));
    await expect(page.locator("main img")).toHaveAttribute("src", "/icon.svg");
    await expect(page.getByRole("link", { name: "Back", exact: true })).toHaveAttribute("href", route === "/login" ? "/" : "/login");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(sharedLayout[1]).toEqual(sharedLayout[0]);

  await page.goto("/reset-password?state=success");
  await page.getByRole("link", { name: "Continue to sign in" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("recovery validates neutrally and allows email correction", async ({ page }) => {
  const external: string[] = [];
  page.on("request", request => { if (!/^(localhost|127\.0\.0\.1)$/.test(new URL(request.url()).hostname)) external.push(request.url()); });
  await page.goto("/forgot-password");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByLabel("Email", { exact: true })).toBeFocused();
  await expect(page.getByText("Enter your email.", { exact: true })).toBeVisible();
  await page.getByLabel("Email", { exact: true }).fill("not-an-email");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();

  for (const email of ["demo@example.com", "unregistered@example.com"]) {
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeFocused();
    await expect(page.getByText(`We sent a password reset link to ${email}.`, { exact: true })).toBeVisible();
    await expect(page.locator("input")).toHaveCount(0);
    await expect(page.locator("[data-preview-notice]")).toContainText("Integration preview");
    await page.getByRole("button", { name: "Use a different email" }).click();
    await expect(page.getByLabel("Email", { exact: true })).toBeFocused();
    await expect(page.getByLabel("Email", { exact: true })).toHaveValue(email);
  }
  expect(external).toEqual([]);
  expect(await page.evaluate(() => ({ ...localStorage }))).toEqual({});
});

test("recovery sample states remain accessible and rate-limited state cannot submit", async ({ page }) => {
  for (const state of ["default", "submitting", "sent", "rate-limited", "error"]) {
    await page.goto(`/forgot-password?state=${state}`);
    await expect(page.locator("main h1")).toBeVisible();
    if (state === "submitting") {
      await expect(page.locator("form")).toHaveAttribute("aria-busy", "true");
      await expect(page.getByRole("button", { name: "Please wait…" })).toBeDisabled();
    }
    if (state === "rate-limited") await expect(page.getByRole("button", { name: "Send reset link" })).toBeDisabled();
    if (state === "sent") {
      await page.getByRole("button", { name: "Use a different email" }).click();
      await expect(page.getByLabel("Email", { exact: true })).toBeFocused();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }

  await page.goto("/forgot-password?state=error");
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual([]);
});
