import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("foundation is accessible, responsive, and honest about its current integration state", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");

  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toContainText("Build your SaaS.");
  await expect(heading).toContainText("Start from the foundation.");

  const getStarted = page.getByRole("link", { name: "Get started" }).first();
  await expect(getStarted).toHaveAttribute("href", "/signup");
  await expect(page.locator("[data-preview-notice]")).toContainText("Integration preview");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveAttribute("href", "#main");

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  expect(await heading.evaluate((element) => getComputedStyle(element).fontWeight)).toBe("500");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");

  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual([]);
  expect(errors).toEqual([]);

  await page.screenshot({ path: testInfo.outputPath("foundation.png"), fullPage: true });

  await page.goto("/help");
  const support = page.getByRole("link", { name: "Contact support" });
  await expect(support).toHaveAttribute("href", "mailto:support@example.com");

  await page.goto("/app");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  expect(errors).toEqual([]);
});
