import { AuthScreen } from "@/components/auth/auth-screen";
import { getSiteConfig } from "@/config/site";
export const metadata = {title:"Sign in"};
export default function Page(){return <AuthScreen mode="login" supportEmail={getSiteConfig().supportEmail}/>;}
