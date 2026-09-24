import "server-only";
import { productConfig } from "./product";
import { getPublicEnv } from "@/lib/env/public";
import { getServerEnv } from "@/lib/env/server";

export function getSiteConfig() {
  return { ...productConfig, url: getPublicEnv().NEXT_PUBLIC_SITE_URL, supportEmail: getServerEnv().SUPPORT_EMAIL };
}
