import { describe, expect, it, vi } from "vitest";
import { parsePurchasableCatalog } from "@/config/catalog-schema";
import { getPurchasableCatalog } from "@/config/catalog";
import { foundationEnv } from "../fixtures/env";

const valid = {
  currency: "usd",
  monthly: { priceId: "price_monthly", interval: "month" },
  annual: { priceId: "price_annual", interval: "year" },
};

describe("server-owned catalog foundation", () => {
  it("preserves exactly the two supported Stripe Price IDs and intervals", () => {
    expect(parsePurchasableCatalog(valid)).toEqual(valid);
  });

  it.each([
    { ...valid, monthly: { ...valid.monthly, priceId: undefined } },
    { ...valid, annual: { ...valid.annual, priceId: valid.monthly.priceId } },
    { ...valid, annual: { ...valid.annual, interval: "month" } },
    { ...valid, currency: "" },
  ])("fails closed for incomplete or incoherent catalog configuration", (catalog) => {
    expect(() => parsePurchasableCatalog(catalog)).toThrow("Invalid billing catalog");
  });

  it("does not invent missing Price IDs", () => {
    vi.stubEnv("SUPPORT_EMAIL", foundationEnv.SUPPORT_EMAIL);
    vi.stubEnv("STRIPE_PRO_MONTHLY_PRICE_ID", "");
    vi.stubEnv("STRIPE_PRO_ANNUAL_PRICE_ID", "");
    expect(() => getPurchasableCatalog()).toThrow("Invalid billing catalog");
  });

  it("resolves configured IDs only from server environment", () => {
    vi.stubEnv("SUPPORT_EMAIL", foundationEnv.SUPPORT_EMAIL);
    vi.stubEnv("STRIPE_PRO_MONTHLY_PRICE_ID", "price_monthly");
    vi.stubEnv("STRIPE_PRO_ANNUAL_PRICE_ID", "price_annual");
    expect(getPurchasableCatalog()).toEqual(valid);
  });
});
