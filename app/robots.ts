import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteConfig();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/app/", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email", "/auth/"] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
