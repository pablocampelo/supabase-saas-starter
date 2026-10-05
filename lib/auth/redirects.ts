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
