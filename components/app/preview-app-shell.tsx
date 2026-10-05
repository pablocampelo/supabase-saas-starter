"use client";

import { type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "./app-shell";
import { PreviewButton } from "@/components/shared/preview-button";
import { PreviewNotice } from "@/components/shared/preview-notice";
import { getPreview, resolveScenario } from "@/lib/ui/fixtures";
import type { PricingViewModel } from "@/lib/ui/models";

export function PreviewAppShell({ children, pricing, supportEmail }: { children: ReactNode; pricing: PricingViewModel; supportEmail: string }) {
  const search = useSearchParams();
  const scenario = resolveScenario(search.get("scenario"), process.env.NODE_ENV === "development");
  const app = getPreview(scenario);
  const href = (path: string) => process.env.NODE_ENV === "development" && scenario !== "free" ? `${path}?scenario=${scenario}` : path;

  return <AppShell app={app} href={href} pricing={pricing} supportEmail={supportEmail} environmentNotice={<PreviewNotice>Sample account data only. No account, persistence, email, or payment mutation is connected.{scenario !== "free" ? ` Scenario: ${scenario}.` : ""}</PreviewNotice>} accountMenuFooter={<PreviewButton action="logout">Sign out</PreviewButton>}>{children}</AppShell>;
}
