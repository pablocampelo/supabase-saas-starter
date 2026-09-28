import type { AccountPlanViewModel, BillingUiStatus, EntitlementsViewModel, PricingViewModel } from "./models";

export const billingPresentation: Record<BillingUiStatus, { label: string; title: string; description: string; tone: "neutral" | "success" | "warning" | "danger" }> = {
  free: { label: "Free", title: "A place to start.", description: "You're currently on the Free plan. Read and delete your retained notes. Creating and editing notes requires Pro.", tone: "neutral" },
  active: { label: "Active", title: "You're on Pro.", description: "Create and edit your private Notes example. Your access follows the paid period shown below.", tone: "success" },
  confirming: { label: "Confirming", title: "Confirming your payment", description: "Payment is not confirmed. Pro access will only begin after trusted server-side confirmation. Returning from Checkout does not grant access.", tone: "neutral" },
  past_due: { label: "Past due", title: "Your payment needs attention.", description: "No new paid period was granted. In this example, the previous paid period has ended. You can still read and delete your retained notes.", tone: "warning" },
  canceling: { label: "Canceling", title: "Your plan ends at the paid-through date.", description: "Pro remains available through the end of your already-paid period. Your subscription will not renew.", tone: "warning" },
  expired: { label: "Expired", title: "You're back on Free.", description: "Your Pro access has ended. Your retained notes are still yours to read or delete. Subscribe again to create and edit.", tone: "neutral" },
  failed: { label: "Needs attention", title: "Payment wasn't confirmed.", description: "No Pro access was granted. You can try again or contact support if you need help. This is not a successful payment.", tone: "danger" },
};
export function noteControls(entitlements: EntitlementsViewModel) {
  return { create: entitlements.canCreateNotes, edit: entitlements.canEditNotes, read: entitlements.canReadOwnNotes, delete: entitlements.canDeleteOwnNotes };
}
export function canChooseInterval(plan: AccountPlanViewModel) { return !plan.hasCurrentSubscription; }
export function displayPrice(pricing: PricingViewModel, interval: "month" | "year") {
  const amount = interval === "month" ? pricing.monthly : pricing.annual;
  return amount === null ? "Price to be configured" : formatMoney(amount, pricing.currency);
}
export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: amount % 100 === 0 ? 0 : 2 }).format(amount / 100);
}
export function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}
