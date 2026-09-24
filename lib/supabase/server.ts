import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicEnv } from "@/lib/env/public";

// Request-scoped and unprivileged. Phase 1 must wire session refresh in proxy
// before protected routes use this client; the client itself is not an auth guard.
export async function createClient() {
  const env = getPublicEnv();
  const store = await cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        // Invoke session-changing methods only in Server Actions/Route Handlers.
        // Deliberately propagate write errors instead of silently losing a session.
        values.forEach(({ name, value, options }) => store.set(name, value, options));
      },
    },
  });
}
