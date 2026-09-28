// Presentation contracts only. These are not database or authorization types.
export type UserViewModel = { id: string; name: string; firstName: string; email: string; emailVerified: boolean };
export type PlanTier = "free" | "pro";
export type BillingInterval = "month" | "year" | null;
export type BillingUiStatus = "free" | "confirming" | "active" | "past_due" | "canceling" | "expired" | "failed";
export type AccountPlanViewModel = { tier: PlanTier; interval: BillingInterval; status: BillingUiStatus; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean; hasCurrentSubscription: boolean };
export type EntitlementsViewModel = { canCreateNotes: boolean; canEditNotes: boolean; canReadOwnNotes: boolean; canDeleteOwnNotes: boolean };
export type NoteViewModel = { id: string; title: string; body: string; createdAt: string; updatedAt: string };
export type PreviewViewModel = { user: UserViewModel; plan: AccountPlanViewModel; entitlements: EntitlementsViewModel; notes: NoteViewModel[]; display: "ready" | "loading" | "error" };
export type PricingViewModel = { currency: string; freeAmount: number; monthly: number | null; annual: number | null };
export type UiAction = "sign-in" | "sign-up" | "resend" | "reset" | "save-note" | "delete-note" | "save-profile" | "checkout" | "portal" | "logout";
export type UiActionResult = { kind: "preview-only"; message: string };
