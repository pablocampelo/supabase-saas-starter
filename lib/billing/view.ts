import type { AccountPlanViewModel, BillingInterval, BillingUiStatus } from "@/lib/ui/models";

export type CurrentBillingPlan = {
  billing_interval: string | null;
  subscription_status: string | null;
  paid_through: string | null;
  cancel_at_period_end: boolean;
  has_current_subscription: boolean;
};

function intervalOf(value: string | null): BillingInterval {
  return value === "month" || value === "year" ? value : null;
}

function statusOf(plan: CurrentBillingPlan | null, hasPro: boolean): BillingUiStatus {
  if (!plan) return "free";

  if (hasPro) {
    if (plan.cancel_at_period_end || plan.subscription_status === "canceled") return "canceling";
    if (plan.subscription_status === "past_due" || plan.subscription_status === "unpaid") return "past_due";
    return "active";
  }

  if (plan.has_current_subscription) {
    if (plan.subscription_status === "past_due" || plan.subscription_status === "unpaid") return "past_due";
    return "confirming";
  }

  if (plan.paid_through) return "expired";
  if (plan.subscription_status) return "failed";
  return "free";
}

export function toAccountPlanViewModel(
  plan: CurrentBillingPlan | null,
  hasPro: boolean,
): AccountPlanViewModel {
  return {
    tier: hasPro ? "pro" : "free",
    interval: intervalOf(plan?.billing_interval ?? null),
    status: statusOf(plan, hasPro),
    currentPeriodEnd: plan?.paid_through ?? null,
    cancelAtPeriodEnd: plan?.cancel_at_period_end ?? false,
    hasCurrentSubscription: plan?.has_current_subscription ?? false,
  };
}
