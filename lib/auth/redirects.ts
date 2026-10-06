const APP_RETURN_PATH = /^\/app(?:\/(?:example(?:\/[a-zA-Z0-9-]+)?|billing|account|help))?$/;

function sameOriginPath(value: string, siteUrl?: string): string | null {
  if (!/^https?:\/\//i.test(value)) return value;
  if (!siteUrl) return null;

  try {
    const target = new URL(value);
    const site = new URL(siteUrl);
    if (target.origin !== site.origin || target.search || target.hash) return null;
    return target.pathname;
  } catch {
    return null;
  }
}

export function safeReturnPath(value: string | null | undefined, siteUrl?: string): string {
  if (!value) return "/app";
  const candidate = sameOriginPath(value.trim(), siteUrl);
  return candidate && APP_RETURN_PATH.test(candidate) ? candidate : "/app";
}

// Use the exact registered OAuth callback URL for the default app destination.
// Hosted Supabase Auth may fall back to Site URL when a query-bearing redirect_to
// is not on its allowed redirect list, losing the PKCE code exchange entirely.
export function googleCallbackUrl(origin: string, requestedNext: string | null): string {
  const callback = new URL("/auth/callback", origin);
  const next = safeReturnPath(requestedNext);
  if (next !== "/app") callback.searchParams.set("next", next);
  return callback.toString();
}
