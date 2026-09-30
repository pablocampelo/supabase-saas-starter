import { redirect } from "next/navigation";
import { LiveAppShell } from "@/components/app/live-app-shell";
import { toExampleResourceViewModel } from "@/lib/example/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPreview } from "@/lib/ui/fixtures";
import type { AppViewModel, PricingViewModel } from "@/lib/ui/models";

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

  const [entitlement, examples] = await Promise.all([
    supabase.rpc("has_pro"),
    supabase
      .from("example_resources")
      .select("id,title,content,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .limit(50),
  ]);
  if (entitlement.error || examples.error) throw new Error("APP_DATA_LOAD_FAILED");

  const name = displayName(user);
  const base = getPreview("free");
  const canWriteExample = entitlement.data === true;
  const app: AppViewModel = {
    ...base,
    user: {
      id: user.id,
      name,
      firstName: name.split(/\s+/)[0] || name,
      email: user.email,
      emailVerified: Boolean(user.email_confirmed_at),
    },
    entitlements: {
      canCreateExample: canWriteExample,
      canEditExample: canWriteExample,
      canReadOwnExample: true,
      canDeleteOwnExample: true,
    },
    examples: (examples.data ?? []).map(toExampleResourceViewModel),
  };

  return <LiveAppShell app={app} pricing={pricing} supportEmail={supportEmail}>{children}</LiveAppShell>;
}
