import { AuthScreen } from "@/components/auth/auth-screen";
import { getSiteConfig } from "@/config/site";
export const metadata = {title:"Reset password"};
export default function Page(){return <AuthScreen mode="reset-password" supportEmail={getSiteConfig().supportEmail}/>;}
