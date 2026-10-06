import { NextResponse, type NextRequest } from "next/server";
import { googleCallbackUrl } from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const redirectTo = googleCallbackUrl(request.nextUrl.origin, request.nextUrl.searchParams.get("next"));
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/auth/error?code=oauth_start_failed", request.url));
  }

  return NextResponse.redirect(data.url);
}
