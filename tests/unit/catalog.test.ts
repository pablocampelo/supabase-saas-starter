import { describe, expect, it, vi } from "vitest";
import { parsePurchasableCatalog } from "@/config/catalog-schema";
import { getPurchasableCatalog } from "@/config/catalog";
import { foundationEnv } from "../fixtures/env";

const valid = {
  currency: "usd",
  monthly: { priceId: "price_monthly", amount: 1200, interval: "month", active: true },
  annual: { priceId: "price_annual", amount: 12000, interval: "year", active: true },
};

describe("server-owned catalog foundation", () => {
  it("preserves the two supported intervals and amounts", () => {
    expect(parsePurchasableCatalog(valid)).toEqual(valid);
  });
  it.each([
    { ...valid, monthly: { ...valid.monthly, priceId: undefined } },
    { ...valid, annual: { ...valid.annual, priceId: valid.monthly.priceId } },
    { ...valid, annual: { ...valid.annual, interval: "month" } },
    { ...valid, monthly: { ...valid.monthly, amount: 0 } },
    { ...valid, monthly: { ...valid.monthly, active: false } },
    { ...valid, currency: "" },
  ])("fails closed for incomplete or incoherent catalogs", (catalog) => {
    expect(() => parsePurchasableCatalog(catalog)).toThrow("Invalid billing catalog");
  });
  it("does not replace missing price configuration with fictitious prices", () => {
    vi.stubEnv("SUPPORT_EMAIL", foundationEnv.SUPPORT_EMAIL);
    for (const key of ["STRIPE_PRO_MONTHLY_PRICE_ID", "STRIPE_PRO_ANNUAL_PRICE_ID", "PRO_MONTHLY_AMOUNT", "PRO_ANNUAL_AMOUNT"]) vi.stubEnv(key, "");
    expect(() => getPurchasableCatalog()).toThrow("Invalid billing catalog");
  });
  it("resolves configured IDs and amounts only from server environment", () => {
    vi.stubEnv("SUPPORT_EMAIL", foundationEnv.SUPPORT_EMAIL);
    vi.stubEnv("STRIPE_PRO_MONTHLY_PRICE_ID", "price_monthly");
    vi.stubEnv("STRIPE_PRO_ANNUAL_PRICE_ID", "price_annual");
    vi.stubEnv("PRO_MONTHLY_AMOUNT", "1200");
    vi.stubEnv("PRO_ANNUAL_AMOUNT", "12000");
    expect(getPurchasableCatalog()).toEqual(valid);
  });
});
