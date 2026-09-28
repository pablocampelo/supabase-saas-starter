import type { PreviewViewModel, AccountPlanViewModel, NoteViewModel } from "./models";

export const scenarioNames = ["free", "retained", "pro-monthly", "pro-annual", "confirming", "past-due", "canceling", "expired", "failed", "unverified", "pro-empty", "loading", "error"] as const;
export type Scenario = typeof scenarioNames[number];
export function resolveScenario(value: string | null, development: boolean): Scenario {
  return development && scenarioNames.includes(value as Scenario) ? value as Scenario : "free";
}

const notes: NoteViewModel[] = [
  { id: "first-note", title: "Make this space your own", body: "This is an example note for visual review.\n\nReplace Notes with the resource your product needs. Keep ownership, private data, and paid write access at the server and database boundaries.", createdAt: "2026-09-20T10:00:00Z", updatedAt: "2026-09-24T09:30:00Z" },
  { id: "launch-outline", title: "A small launch outline", body: "Configure your brand.\nConnect your services in a later implementation phase.\nVerify the complete journey before publishing.\n\nExample content only — no data has been saved.", createdAt: "2026-09-19T10:00:00Z", updatedAt: "2026-09-23T15:00:00Z" },
  { id: "product-principles", title: "Keep the useful parts", body: "A focused product. Clear boundaries. A foundation you can understand and change.\n\nThis document is a deterministic UI fixture.", createdAt: "2026-09-18T10:00:00Z", updatedAt: "2026-09-22T10:00:00Z" },
];
export const fixtureNoteIds = notes.map((note) => note.id);

export function getPreview(scenario: Scenario): PreviewViewModel {
  const plan: AccountPlanViewModel = { tier: "free", interval: null, status: "free", currentPeriodEnd: null, cancelAtPeriodEnd: false, hasCurrentSubscription: false };
  if (["pro-monthly", "pro-annual", "pro-empty", "canceling"].includes(scenario)) {
    Object.assign(plan, { tier: "pro", interval: scenario === "pro-annual" ? "year" : "month", status: scenario === "canceling" ? "canceling" : "active", currentPeriodEnd: scenario === "pro-annual" ? "2027-09-24" : "2026-10-24", cancelAtPeriodEnd: scenario === "canceling", hasCurrentSubscription: true });
  }
  if (scenario === "past-due") Object.assign(plan, { status: "past_due", interval: "month", currentPeriodEnd: "2026-09-23", hasCurrentSubscription: true });
  if (scenario === "confirming") Object.assign(plan, { status: "confirming", interval: "month", hasCurrentSubscription: true });
  if (scenario === "failed") plan.status = "failed";
  if (["expired", "retained"].includes(scenario)) plan.status = "expired";
  const canWrite = plan.tier === "pro";
  return {
    user: { id: "ui-fixture", name: "Demo account", firstName: "Demo", email: "demo@example.com", emailVerified: scenario !== "unverified" },
    plan,
    entitlements: { canCreateNotes: canWrite, canEditNotes: canWrite, canReadOwnNotes: true, canDeleteOwnNotes: true },
    notes: ["retained", "pro-monthly", "pro-annual", "past-due", "canceling", "expired"].includes(scenario) ? notes.map((note) => ({ ...note })) : [],
    display: scenario === "loading" ? "loading" : scenario === "error" ? "error" : "ready",
  };
}
