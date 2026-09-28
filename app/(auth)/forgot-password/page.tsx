import { AuthScreen } from "@/components/auth/auth-screen";
import { getSiteConfig } from "@/config/site";
export const metadata = {title:"Password recovery"};
export default function Page(){return <AuthScreen mode="forgot-password" supportEmail={getSiteConfig().supportEmail}/>;}
