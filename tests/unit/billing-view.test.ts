import { describe, expect, it } from "vitest";
import { toAccountPlanViewModel, type CurrentBillingPlan } from "@/lib/billing/view";

const base: CurrentBillingPlan = {
  billing_interval: "month",
  subscription_status: "active",
  paid_through: "2026-11-01T00:00:00Z",
  cancel_at_period_end: false,
  has_current_subscription: true,
};

describe("billing projection presentation", () => {
  it("shows Free when no billing projection exists", () => {
    expect(toAccountPlanViewModel(null, false)).toEqual({
      tier: "free",
      interval: null,
      status: "free",
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      hasCurrentSubscription: false,
    });
  });

  it("shows confirmed Pro from paid-through, not subscription status alone", () => {
    expect(toAccountPlanViewModel(base, true)).toMatchObject({
      tier: "pro",
      status: "active",
      currentPeriodEnd: base.paid_through,
    });
    expect(toAccountPlanViewModel({ ...base, paid_through: null }, false)).toMatchObject({
      tier: "free",
      status: "confirming",
    });
  });

  it("keeps paid access while a renewal is past due", () => {
    expect(toAccountPlanViewModel({ ...base, subscription_status: "past_due" }, true)).toMatchObject({
      tier: "pro",
      status: "past_due",
    });
  });

  it("shows canceling while an already-paid period remains", () => {
    expect(toAccountPlanViewModel({ ...base, cancel_at_period_end: true }, true)).toMatchObject({
      tier: "pro",
      status: "canceling",
      cancelAtPeriodEnd: true,
    });
  });

  it("returns to Free after retained paid access expires", () => {
    expect(toAccountPlanViewModel({ ...base, subscription_status: "canceled", has_current_subscription: false }, false)).toMatchObject({
      tier: "free",
      status: "expired",
      hasCurrentSubscription: false,
    });
  });
});
