"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";
import { PreviewNotice } from "@/components/shared/preview-notice";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/actions";
import type { AppViewModel, PricingViewModel } from "@/lib/ui/models";

export function LiveAppShell({ children, app, pricing, supportEmail }: { children: ReactNode; app: AppViewModel; pricing: PricingViewModel; supportEmail: string }) {
  return <AppShell app={app} href={path => path} pricing={pricing} supportEmail={supportEmail} environmentNotice={<PreviewNotice>Authentication and account identity are live. Billing and Example data remain deterministic sample state until their implementation phases.</PreviewNotice>} accountMenuFooter={<form action={signOutAction}><Button type="submit" variant="ghost" size="sm">Sign out</Button></form>}>{children}</AppShell>;
}
