// Presentation contracts only. These are not database or authorization types.
export type UserViewModel = { id: string; name: string; firstName: string; email: string; emailVerified: boolean };
export type PlanTier = "free" | "pro";
export type BillingInterval = "month" | "year" | null;
export type BillingUiStatus = "free" | "confirming" | "active" | "past_due" | "canceling" | "expired" | "failed";
export type AccountPlanViewModel = { tier: PlanTier; interval: BillingInterval; status: BillingUiStatus; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean; hasCurrentSubscription: boolean };
export type EntitlementsViewModel = { canCreateExample: boolean; canEditExample: boolean; canReadOwnExample: boolean; canDeleteOwnExample: boolean };
export type ExampleResourceViewModel = { id: string; title: string; content: string; createdAt: string; updatedAt: string };
export type ExampleSummaryViewModel = Pick<ExampleResourceViewModel, "id" | "title" | "updatedAt">;
export type AppViewModel = { user: UserViewModel; plan: AccountPlanViewModel; entitlements: EntitlementsViewModel; display: "ready" | "loading" | "error" };
export type PricingViewModel = { currency: string; freeAmount: number; monthly: number | null; annual: number | null };
export type UiAction = "google" | "sign-in" | "sign-up" | "resend" | "reset" | "save-example" | "delete-example" | "save-profile" | "checkout" | "portal" | "logout";
export type UiActionResult = { kind: "preview-only"; message: string };
