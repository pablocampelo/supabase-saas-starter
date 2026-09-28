import { redirect } from "next/navigation";
import { LiveAppShell } from "@/components/app/live-app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPreview } from "@/lib/ui/fixtures";
import type { PricingViewModel } from "@/lib/ui/models";

function displayName(user: { email?: string; user_metadata?: Record<string, unknown> }) {
  const metadata = user.user_metadata ?? {};
  const candidate = metadata.display_name ?? metadata.full_name ?? metadata.name;
  if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  return user.email?.split("@")[0] || "Account";
}

export async function AuthenticatedAppShell({ children, pricing, supportEmail }: { children: React.ReactNode; pricing: PricingViewModel; supportEmail: string }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.email) redirect("/login");

  const name = displayName(user);
  const base = getPreview("free");
  const app = {
    ...base,
    user: {
      name,
      firstName: name.split(/\s+/)[0] || name,
      email: user.email,
      emailVerified: Boolean(user.email_confirmed_at),
    },
  };

  return <LiveAppShell app={app} pricing={pricing} supportEmail={supportEmail}>{children}</LiveAppShell>;
}
