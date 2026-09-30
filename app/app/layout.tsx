import { Suspense } from "react";
import { AuthenticatedAppShell } from "@/components/app/authenticated-app-shell";
import { PreviewAppShell } from "@/components/app/preview-app-shell";
import { PageSkeleton } from "@/components/shared/patterns";
import { getSiteConfig } from "@/config/site";
import { getPricingView } from "@/config/pricing";
import { isE2EAuthBypassEnabled } from "@/lib/auth/e2e";

export const metadata = { title: "App", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pricing = getPricingView();
  const supportEmail = getSiteConfig().supportEmail;
  const shell = isE2EAuthBypassEnabled()
    ? <PreviewAppShell pricing={pricing} supportEmail={supportEmail}>{children}</PreviewAppShell>
    : <AuthenticatedAppShell pricing={pricing} supportEmail={supportEmail}>{children}</AuthenticatedAppShell>;

  return <Suspense fallback={<div className="site-container py-12"><PageSkeleton/></div>}><>{shell}</></Suspense>;
}
