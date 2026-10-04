import { describe, expect, it } from "vitest";
import { validateHistoricalStripePrice, validateStripePrice } from "@/lib/billing/catalog";

const option = { interval: "month" as const, priceId: "price_monthly" };
const fact = {
  id: "price_monthly",
  active: true,
  currency: "usd",
  unitAmount: 1200,
  recurringInterval: "month" as const,
  recurringIntervalCount: 1,
};

describe("Stripe Price catalog validation", () => {
  it("accepts only the configured recurring Price facts", () => {
    expect(validateStripePrice(option, fact, "usd")).toEqual({
      ...option,
      amount: 1200,
      currency: "usd",
    });
  });

  it.each([
    [{ ...fact, id: "price_other" }, "Stripe Price ID mismatch"],
    [{ ...fact, active: false }, "Stripe Price is not active for new purchases"],
    [{ ...fact, currency: "eur" }, "Stripe Price currency mismatch"],
    [{ ...fact, unitAmount: null }, "Stripe Price amount is unsupported"],
    [{ ...fact, unitAmount: 0 }, "Stripe Price amount is unsupported"],
    [{ ...fact, recurringInterval: "year" as const }, "Stripe Price recurrence mismatch"],
    [{ ...fact, recurringIntervalCount: 2 }, "Stripe Price recurrence mismatch"],
  ])("fails closed for unsupported provider facts", (candidate, message) => {
    expect(() => validateStripePrice(option, candidate, "usd")).toThrow(message);
  });
});

describe("historical Stripe Price validation", () => {
  it("keeps an archived Price valid for an already-mapped subscription", () => {
    expect(validateHistoricalStripePrice(option, { ...fact, active: false }, "usd")).toEqual({
      ...option,
      amount: 1200,
      currency: "usd",
    });
  });

  it("still rejects unsupported historical financial facts", () => {
    expect(() => validateHistoricalStripePrice(option, { ...fact, currency: "eur" }, "usd")).toThrow(
      "Stripe Price currency mismatch",
    );
    expect(() => validateHistoricalStripePrice(option, { ...fact, unitAmount: 0 }, "usd")).toThrow(
      "Stripe Price amount is unsupported",
    );
    expect(() => validateHistoricalStripePrice(option, { ...fact, recurringIntervalCount: 2 }, "usd")).toThrow(
      "Stripe Price recurrence mismatch",
    );
  });
});
