import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { getSiteConfig } from "@/config/site";
import "./globals.css";

const inter = localFont({ src: "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2", variable: "--font-inter", display: "swap", weight: "100 900" });

export function generateMetadata(): Metadata {
  const site = getSiteConfig();
  const socialImage = {
    url: "/opengraph-image",
    width: 1280,
    height: 640,
    alt: "Xerv — Build the product. Not the infrastructure. Open-source SaaS foundation.",
  };
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
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: site.seo.title,
      description: site.seo.description,
      images: [socialImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={inter.variable}><body>{children}<Analytics /></body></html>;
}
