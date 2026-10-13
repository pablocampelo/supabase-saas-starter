import type { Metadata } from "next";
import { productConfig } from "./product";

const socialImage = {
  url: "/social-preview.png",
  width: 1200,
  height: 630,
  alt: "Xerv SaaS foundation preview",
};

export function publicMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${title} | ${productConfig.name}`,
      description,
      url: path,
      siteName: productConfig.name,
      type: "website",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${productConfig.name}`,
      description,
      images: [socialImage],
    },
  };
}
