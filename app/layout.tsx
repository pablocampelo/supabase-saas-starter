import type { Metadata } from "next";
import localFont from "next/font/local";
import { getSiteConfig } from "@/config/site";
import "./globals.css";

const inter = localFont({ src: "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2", variable: "--font-inter", display: "swap", weight: "100 900" });
const funnelSans = localFont({ src: "../node_modules/@fontsource-variable/funnel-sans/files/funnel-sans-latin-wght-normal.woff2", variable: "--font-funnel-sans", display: "swap", weight: "300 800" });

export function generateMetadata(): Metadata {
  const site = getSiteConfig();
  const socialAlt = "SupaSaaS sign up screen";
  return {
    metadataBase: new URL(site.url),
    title: { default: site.seo.title, template: `%s | ${site.name}` },
    description: site.seo.description,
    robots: { index: true, follow: true },
    openGraph: {
      title: site.seo.title,
      description: site.seo.description,
      url: "/",
      siteName: site.name,
      type: "website",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: socialAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: site.seo.title,
      description: site.seo.description,
      images: [{ url: "/twitter-image", alt: socialAlt }],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${inter.variable} ${funnelSans.variable}`}><body>{children}</body></html>;
}
