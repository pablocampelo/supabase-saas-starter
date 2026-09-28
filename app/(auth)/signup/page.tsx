import { AuthScreen } from "@/components/auth/auth-screen";
import { getSiteConfig } from "@/config/site";
export const metadata = {title:"Create an account"};
export default function Page(){return <AuthScreen mode="signup" supportEmail={getSiteConfig().supportEmail}/>;}
