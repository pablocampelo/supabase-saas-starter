import { Suspense } from "react";
import { PreviewAppShell } from "@/components/app/preview-app-shell";
import { PageSkeleton } from "@/components/shared/patterns";
import { getSiteConfig } from "@/config/site";
import { getPricingView } from "@/config/pricing";

export const metadata = { title: "App", robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="site-container py-12"><PageSkeleton/></div>}><PreviewAppShell pricing={getPricingView()} supportEmail={getSiteConfig().supportEmail}>{children}</PreviewAppShell></Suspense>;
}
