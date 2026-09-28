"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, CreditCard, FileText, LayoutDashboard, Menu, UserRound, ChevronDown } from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Notice, PageSkeleton } from "@/components/shared/patterns";
import { productConfig } from "@/config/product";
import type { AppViewModel, PricingViewModel } from "@/lib/ui/models";

type AppUiContextValue = { app: AppViewModel; href: (path: string) => string; pricing: PricingViewModel; supportEmail: string };
const AppUiContext = createContext<AppUiContextValue | null>(null);

export function useAppUi() {
  const context = useContext(AppUiContext);
  if (!context) throw new Error("App UI provider missing");
  return context;
}

const icons = [LayoutDashboard, FileText, CreditCard, UserRound, CircleHelp];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}` : name.slice(0, 2)).toUpperCase();
}

export function AppShell({ children, app, href, pricing, supportEmail, environmentNotice, accountMenuFooter }: { children: ReactNode; app: AppViewModel; href: (path: string) => string; pricing: PricingViewModel; supportEmail: string; environmentNotice?: ReactNode; accountMenuFooter?: ReactNode }) {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const navigation = <nav aria-label="App navigation" className="space-y-1">{productConfig.navigation.app.map((item, i) => {
    const Icon = icons[i]!;
    const active = item.href === "/app" ? pathname === item.href : pathname.startsWith(item.href);
    return <div key={item.href} className={i === 2 ? "mt-5 border-t pt-5" : ""}><Link href={href(item.href)} aria-current={active ? "page" : undefined} onClick={() => setDrawer(false)} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${active ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon className="size-4" aria-hidden="true"/>{item.label}</Link></div>;
  })}</nav>;

  return <AppUiContext value={{ app, href, pricing, supportEmail }}><a className="skip-link" href="#main">Skip to content</a><header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85"><div className="site-container flex h-16 items-center justify-between gap-3"><div className="flex items-center gap-3"><Button className="md:hidden" size="sm" variant="ghost" aria-label="Open navigation" onClick={() => setDrawer(true)}><Menu aria-hidden="true"/></Button><Brand href={href("/app")}/></div><div className="relative"><Button variant="ghost" size="sm" aria-label="Open account menu" aria-expanded={userMenu} aria-controls="account-menu" onClick={() => setUserMenu(!userMenu)}><span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs">{initials(app.user.name)}</span><span className="hidden max-w-44 truncate sm:inline">{app.user.name}</span><ChevronDown aria-hidden="true"/></Button>{userMenu && <div id="account-menu" className="absolute right-0 top-12 z-30 w-64 rounded-lg border bg-popover p-4 text-popover-foreground shadow-sm" onKeyDown={event => { if (event.key === "Escape") { setUserMenu(false); (event.currentTarget.previousElementSibling as HTMLElement)?.focus(); } }}><p className="truncate text-sm font-medium">{app.user.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{app.user.email}</p><Link className="text-link mb-4 mt-4 block" href={href("/app/account")} onClick={() => setUserMenu(false)}>Manage account</Link>{accountMenuFooter}</div>}</div></div></header><Dialog drawer open={drawer} onClose={() => setDrawer(false)} title="Navigation">{navigation}</Dialog><div className="site-container flex gap-12 py-8 md:py-10"><aside className="hidden w-[200px] shrink-0 md:block">{navigation}<p className="mt-10 px-3 text-xs leading-6 text-muted-foreground">Individual account.<br/>Private by default.</p></aside><main id="main" className="min-w-0 flex-1">{environmentNotice ? <div className="mb-7">{environmentNotice}</div> : null}{app.display === "loading" ? <PageSkeleton/> : app.display === "error" ? <div className="space-y-5"><h1 className="text-3xl">Unable to load this page</h1><Notice tone="danger">Your data has not changed. Try again, then contact support if the problem continues. Reference: UI-PREVIEW.</Notice><Button asChild><Link href={pathname}>Try again</Link></Button><p><Link href={href("/app/help")} className="text-link">Contact support</Link></p></div> : children}</main></div></AppUiContext>;
}
