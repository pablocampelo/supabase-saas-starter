import { publicMetadata } from "@/config/metadata";
import { HelpContent } from "@/components/shared/help-content";
import { PageHeader } from "@/components/shared/patterns";
import { getSiteConfig } from "@/config/site";
export const metadata = publicMetadata("Help", "Get help with access, billing, and sensitive account changes.", "/help");
export default function Page() { return <div className="site-container max-w-4xl py-16"><PageHeader title="How can we help?" description="A clear answer, or a direct way to reach support."/><HelpContent supportEmail={getSiteConfig().supportEmail}/></div>; }
