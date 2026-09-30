import { AuthScreen } from "@/components/auth/auth-screen";
import { RealAuthScreen } from "@/components/auth/real-auth-screen";
import { isE2EAuthBypassEnabled } from "@/lib/auth/e2e";

type Mode = "login" | "signup" | "verify-email" | "forgot-password" | "reset-password" | "error";

export function AuthRouteScreen({ mode, supportEmail }: { mode: Mode; supportEmail: string }) {
  if (isE2EAuthBypassEnabled()) return <AuthScreen mode={mode} supportEmail={supportEmail}/>;
  return <RealAuthScreen mode={mode} supportEmail={supportEmail}/>;
}
