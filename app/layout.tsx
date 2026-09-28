import type { Metadata } from "next";
import localFont from "next/font/local";
import { getSiteConfig } from "@/config/site";
import "./globals.css";

const inter = localFont({ src: "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2", variable: "--font-inter", display: "swap", weight: "100 900" });
const funnelSans = localFont({ src: "../node_modules/@fontsource-variable/funnel-sans/files/funnel-sans-latin-wght-normal.woff2", variable: "--font-funnel-sans", display: "swap", weight: "300 800" });

export function generateMetadata(): Metadata {
  const site = getSiteConfig();
  return {
    metadataBase: new URL(site.url),
    title: { default: site.seo.title, template: `%s | ${site.name}` },
    description: site.seo.description,
    // Phase 1 is a UI preview, not a published product offer.
    robots: { index: false, follow: false },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${inter.variable} ${funnelSans.variable}`}><body>{children}</body></html>;
}
