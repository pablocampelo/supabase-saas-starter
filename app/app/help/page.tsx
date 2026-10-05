import { HelpContent } from "@/components/shared/help-content";
import { PageHeader } from "@/components/shared/patterns";
import { getSiteConfig } from "@/config/site";
export const metadata = { title:"Help" };
export default function Page() { return <><PageHeader title="Help" description="Account access, billing questions, and a way forward."/><HelpContent supportEmail={getSiteConfig().supportEmail}/></>; }
