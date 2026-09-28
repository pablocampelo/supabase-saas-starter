import { AuthScreen } from "@/components/auth/auth-screen";
import { getSiteConfig } from "@/config/site";
export const metadata = {title:"Account access error"};
export default function Page(){return <AuthScreen mode="error" supportEmail={getSiteConfig().supportEmail}/>;}
