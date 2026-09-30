import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isE2EAuthBypassEnabled } from "@/lib/auth/e2e";
import { safeReturnPath } from "@/lib/auth/redirects";
import { getPublicEnv } from "@/lib/env/public";

function privateResponse(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

function copySessionResponse(source: NextResponse, target: NextResponse) {
  for (const cookie of source.cookies.getAll()) target.cookies.set(cookie);
  for (const name of ["expires", "pragma"] as const) {
    const value = source.headers.get(name);
    if (value) target.headers.set(name, value);
  }
  return privateResponse(target);
}

export async function updateSession(request: NextRequest) {
  if (isE2EAuthBypassEnabled()) {
    return privateResponse(NextResponse.next({ request }));
  }

  const env = getPublicEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", safeReturnPath(request.nextUrl.pathname));
    return copySessionResponse(response, NextResponse.redirect(loginUrl));
  }

  return privateResponse(response);
}
