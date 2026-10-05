import { beforeEach, describe, expect, it, vi } from "vitest";
import { foundationEnv } from "../fixtures/env";

const mocks = vi.hoisted(() => ({
  browser: vi.fn(), server: vi.fn(), getAll: vi.fn(), set: vi.fn(),
}));
vi.mock("@supabase/ssr", () => ({ createBrowserClient: mocks.browser, createServerClient: mocks.server }));
vi.mock("next/headers", () => ({ cookies: async () => ({ getAll: mocks.getAll, set: mocks.set }) }));
import { createClient as browserClient } from "@/lib/supabase/client";
import { createClient as serverClient } from "@/lib/supabase/server";

beforeEach(() => {
  vi.clearAllMocks();
  for (const [key, value] of Object.entries(foundationEnv)) vi.stubEnv(key, value);
  vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_private_canary");
});

describe("Supabase client foundations", () => {
  it("uses only the publishable key in browser and server clients", async () => {
    browserClient();
    await serverClient();
    expect(mocks.browser).toHaveBeenCalledWith(foundationEnv.NEXT_PUBLIC_SUPABASE_URL, foundationEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
    expect(mocks.server).toHaveBeenCalledWith(foundationEnv.NEXT_PUBLIC_SUPABASE_URL, foundationEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, expect.any(Object));
  });
  it("bridges request cookies and preserves cookie options", async () => {
    mocks.getAll.mockReturnValue([{ name: "session", value: "old" }]);
    await serverClient();
    const adapter = mocks.server.mock.calls[0][2].cookies;
    expect(adapter.getAll()).toEqual([{ name: "session", value: "old" }]);
    adapter.setAll([{ name: "session", value: "new", options: { sameSite: "lax", secure: true, path: "/" } }], {});
    expect(mocks.set).toHaveBeenCalledWith("session", "new", { sameSite: "lax", secure: true, path: "/" });
  });
  it("lets Server Components ignore cookie-write failures because the proxy refreshes sessions", async () => {
    mocks.set.mockImplementationOnce(() => { throw new Error("Cookies cannot be modified here"); });
    await serverClient();
    const adapter = mocks.server.mock.calls[0][2].cookies;
    expect(() => adapter.setAll([{ name: "session", value: "new", options: {} }], {})).not.toThrow();
  });
  it("fails before constructing a client when configuration is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(browserClient).toThrow("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    expect(mocks.browser).not.toHaveBeenCalled();
  });
});
