import { AuthScreen } from "@/components/auth/auth-screen";
import { getSiteConfig } from "@/config/site";
export const metadata = {title:"Verify your email"};
export default function Page(){return <AuthScreen mode="verify-email" supportEmail={getSiteConfig().supportEmail}/>;}
