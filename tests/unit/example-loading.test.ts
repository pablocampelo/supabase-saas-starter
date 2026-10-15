import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  client: vi.fn(), from: vi.fn(), select: vi.fn(), order: vi.fn(), limit: vi.fn(),
  getUser: vi.fn(), rpc: vi.fn(), preview: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: mocks.client }));
vi.mock("@/lib/auth/e2e", () => ({ isE2EAuthBypassEnabled: mocks.preview }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`redirect:${path}`); } }));
vi.mock("@/components/app/live-app-shell", () => ({ LiveAppShell: () => null }));
vi.mock("@/components/app/dashboard", () => ({ Dashboard: () => null }));
vi.mock("@/components/app/example", () => ({ ExampleList: () => null }));

import { AuthenticatedAppShell } from "@/components/app/authenticated-app-shell";
import DashboardPage from "@/app/app/page";
import ExamplePage from "@/app/app/example/page";
import { getExampleSummaries } from "@/lib/example/queries";

const rows = Array.from({ length: 60 }, (_, i) => ({
  id: `resource-${i}`, title: `Resource ${i}`, updated_at: "2026-10-01T00:00:00Z",
  content: "This must not reach a summary", created_at: "2026-09-01T00:00:00Z",
}));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.preview.mockReturnValue(false);
  mocks.getUser.mockResolvedValue({ data: { user: { id: "owner", email: "owner@example.test" } }, error: null });
  mocks.rpc.mockImplementation((name: string) => name === "has_pro"
    ? Promise.resolve({ data: true, error: null })
    : { maybeSingle: async () => ({ data: null, error: null }) });
  mocks.client.mockResolvedValue({ auth: { getUser: mocks.getUser }, rpc: mocks.rpc, from: mocks.from });
  mocks.from.mockReturnValue({ select: mocks.select });
  mocks.select.mockReturnValue({ order: mocks.order });
  mocks.order.mockReturnValue({ limit: mocks.limit });
  mocks.limit.mockImplementation(async (count: number) => ({ data: rows.slice(0, count), error: null }));
});

describe("page-scoped Example reads", () => {
  it("does not read or serialize Example resources in the shared authenticated shell", async () => {
    mocks.from.mockImplementation(() => { throw new Error("Example unavailable"); });
    const shell = await AuthenticatedAppShell({ children: null, pricing: { currency: "usd", freeAmount: 0, monthly: null, annual: null }, supportEmail: "support@example.test" });
    expect(mocks.from).not.toHaveBeenCalled();
    expect(shell.props.app).not.toHaveProperty("examples");
    expect(shell.props.app.user.id).toBe("owner");
    expect(shell.props.app.entitlements.canCreateExample).toBe(true);
  });

  it("keeps the authenticated shell's identity check", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(AuthenticatedAppShell({ children: null, pricing: { currency: "usd", freeAmount: 0, monthly: null, annual: null }, supportEmail: "support@example.test" })).rejects.toThrow("redirect:/login");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it.each([3, 50] as const)("loads only summary fields with the %i row limit and existing order", async (count) => {
    const result = await getExampleSummaries(count);
    expect(mocks.from).toHaveBeenCalledWith("example_resources");
    expect(mocks.select).toHaveBeenCalledWith("id,title,updated_at");
    expect(mocks.order).toHaveBeenCalledWith("updated_at", { ascending: false });
    expect(mocks.limit).toHaveBeenCalledWith(count);
    expect(result).toHaveLength(count);
    expect(result[0]).toEqual({ id: "resource-0", title: "Resource 0", updatedAt: "2026-10-01T00:00:00Z" });
    expect(JSON.stringify(result)).not.toContain("This must not reach a summary");
  });

  it("loads three summaries for Dashboard and fifty for the Example list", async () => {
    const dashboard = await DashboardPage();
    const list = await ExamplePage();
    expect(dashboard.props.examples).toHaveLength(3);
    expect(list.props.examples).toHaveLength(50);
    expect(mocks.limit.mock.calls).toEqual([[3], [50]]);
  });

  it("keeps preview routes independent of Supabase", async () => {
    mocks.preview.mockReturnValue(true);
    expect((await DashboardPage()).props.examples).toBeUndefined();
    expect((await ExamplePage()).props.examples).toBeUndefined();
    expect(mocks.client).not.toHaveBeenCalled();
  });

  it("passes an explicit empty list for an account without resources", async () => {
    mocks.limit.mockResolvedValue({ data: [], error: null });
    expect((await DashboardPage()).props.examples).toEqual([]);
    expect((await ExamplePage()).props.examples).toEqual([]);
  });

  it("does not turn a database read error into a misleading empty state", async () => {
    mocks.limit.mockResolvedValue({ data: null, error: { message: "unavailable" } });
    await expect(ExamplePage()).rejects.toThrow("APP_DATA_LOAD_FAILED");
  });

  it("reads fresh summaries on a subsequent render instead of caching account data", async () => {
    expect((await DashboardPage()).props.examples[0].title).toBe("Resource 0");
    mocks.limit.mockResolvedValue({ data: [{ ...rows[0], title: "Updated resource" }], error: null });
    expect((await DashboardPage()).props.examples[0].title).toBe("Updated resource");
    expect(mocks.client).toHaveBeenCalledTimes(2);
  });
});
