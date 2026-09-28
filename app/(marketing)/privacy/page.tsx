import { publicMetadata } from "@/config/metadata";
import { Legal } from "@/components/marketing/legal";
import { getSiteConfig } from "@/config/site";
export const metadata = publicMetadata("Privacy notice", "Privacy template for buyer adaptation.", "/privacy");
export default function Page(){return <Legal kind="privacy" supportEmail={getSiteConfig().supportEmail}/>;}
