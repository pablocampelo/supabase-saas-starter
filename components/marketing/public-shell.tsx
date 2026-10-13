"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { productConfig } from "@/config/product";

const footerGroups = [
  {
    title: "Product",
    items: [
      ...productConfig.navigation.public.map(({ label, href }) => [label, href] as const),
      ["Sign in", "/login"] as const,
    ],
  },
  {
    title: "Resources",
    items: [["Help", "/help"]],
  },
  {
    title: "Legal",
    items: [
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ],
  },
] as const;

export function PublicShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const mobileItems = [
    ...productConfig.navigation.public,
    { label: "Sign in", href: "/login" },
    { label: "Get Xerv", href: "https://github.com/pablocampelo/xerv" },
  ];

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="bg-background">
        <div className="site-container flex h-16 items-center justify-between gap-4">
          <Brand />
          <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
            {productConfig.navigation.public.map((item) => (
              <Link className="nav-link" key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link className="nav-link" href="/login">
              Sign in
            </Link>
            <Button asChild size="sm" variant="outline">
              <Link href="https://github.com/pablocampelo/xerv">Get Xerv</Link>
            </Button>
          </nav>
          <Button
            className="md:hidden"
            variant="outline"
            size="sm"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <Menu aria-hidden="true" />
          </Button>
        </div>
      </header>

      <Dialog drawer open={open} onClose={() => setOpen(false)} title="Navigation">
        <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
          {mobileItems.map((item) => (
            <Link
              className="rounded-md p-3 text-sm transition-colors hover:bg-muted"
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Dialog>

      <main id="main">{children}</main>

      <footer className="py-12">
        <div className="site-container grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Brand />
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              Build the product. Not the infrastructure. Free and open source under the MIT license.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">Next.js · Supabase · Stripe · Resend · Vercel</p>
          </div>

          {footerGroups.map((group) => (
            <nav aria-label={group.title} key={group.title}>
              <h2 className="mb-4 font-sans text-sm font-semibold">{group.title}</h2>
              <ul className="space-y-3">
                {group.items.map(([label, href]) => (
                  <li key={href}>
                    <Link className="nav-link" href={href}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </footer>
    </>
  );
}
