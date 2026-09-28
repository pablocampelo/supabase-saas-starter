import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const { url } = getSiteConfig();
  return ["/", "/help", "/terms", "/privacy"].map(path => ({ url: new URL(path, url).toString() }));
}
