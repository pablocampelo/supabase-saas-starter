import { NextResponse, type NextRequest } from "next/server";
import { safeReturnPath } from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const next = safeReturnPath(request.nextUrl.searchParams.get("next"));
  const callback = new URL("/auth/callback", request.nextUrl.origin);
  callback.searchParams.set("next", next);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString() },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/auth/error?code=oauth_start_failed", request.url));
  }

  return NextResponse.redirect(data.url);
}
