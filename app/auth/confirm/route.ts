import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeReturnPath } from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const supportedTypes = new Set<EmailOtpType>(["email", "recovery"]);

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const rawType = request.nextUrl.searchParams.get("type") as EmailOtpType | null;

  if (!tokenHash || !rawType || !supportedTypes.has(rawType)) {
    return NextResponse.redirect(new URL("/auth/error?code=invalid_confirmation", request.url));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: rawType });

  if (error) {
    return NextResponse.redirect(new URL("/auth/error?code=confirmation_failed", request.url));
  }

  const next = safeReturnPath(request.nextUrl.searchParams.get("next"), request.nextUrl.origin);
  if (rawType === "recovery") {
    const resetUrl = new URL("/reset-password", request.url);
    resetUrl.searchParams.set("next", next);
    return NextResponse.redirect(resetUrl);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
