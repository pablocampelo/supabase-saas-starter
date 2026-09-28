import { Suspense } from "react";
import { AppShell } from "@/components/app/app-shell";
import { PageSkeleton } from "@/components/shared/patterns";
import { getSiteConfig } from "@/config/site";
import { getPricingView } from "@/config/pricing";
export const metadata = { title: "App preview", robots: {index:false,follow:false} };
export default function Layout({ children }: {children:React.ReactNode}) { return <Suspense fallback={<div className="site-container py-12"><PageSkeleton/></div>}><AppShell pricing={getPricingView()} supportEmail={getSiteConfig().supportEmail}>{children}</AppShell></Suspense>; }
