import type { AppViewModel, AccountPlanViewModel, ProjectViewModel } from "./models";

export const scenarioNames = ["free", "retained", "pro-monthly", "pro-annual", "confirming", "past-due", "canceling", "expired", "failed", "unverified", "pro-empty", "loading", "error"] as const;
export type Scenario = typeof scenarioNames[number];
export function resolveScenario(value: string | null, development: boolean): Scenario {
  return development && scenarioNames.includes(value as Scenario) ? value as Scenario : "free";
}

const projects: ProjectViewModel[] = [
  { id: "first-project", title: "Launch workspace", content: "A small buyer-owned domain replacing the starter Example Resource.", status: "active", createdAt: "2026-09-20T10:00:00Z", updatedAt: "2026-09-24T09:30:00Z" },
  { id: "product-site", title: "Product site", content: "Draft the first customer-facing project without touching Auth or Billing.", status: "draft", createdAt: "2026-09-19T10:00:00Z", updatedAt: "2026-09-23T15:00:00Z" },
];
export const fixtureProjectIds = projects.map((project) => project.id);

export function getPreview(scenario: Scenario): AppViewModel {
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
    entitlements: { canCreateProject: canWrite, canEditProject: canWrite, canReadOwnProject: true, canDeleteOwnProject: true },
    projects: ["retained", "pro-monthly", "pro-annual", "past-due", "canceling", "expired"].includes(scenario) ? projects.map((project) => ({ ...project })) : [],
    display: scenario === "loading" ? "loading" : scenario === "error" ? "error" : "ready",
  };
}
