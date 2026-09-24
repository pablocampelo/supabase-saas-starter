import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("foundation is accessible, responsive, and honest about its scope", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Start with the foundation.");
  const support = page.getByRole("link", { name: "Contact support" });
  await expect(support).toHaveAttribute("href", "mailto:support@example.com");
  await page.keyboard.press("Tab");
  await expect(support).toBeFocused();
  expect(await support.evaluate((element) => element.getBoundingClientRect().height)).toBe(40);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  expect(await page.getByRole("heading", { level: 1 }).evaluate((element) => getComputedStyle(element).fontWeight)).toBe("600");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual([]);
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("foundation.png"), fullPage: true });
});
