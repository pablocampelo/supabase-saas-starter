import { AuthRouteScreen } from "@/components/auth/auth-route-screen";
import { getSiteConfig } from "@/config/site";

export const metadata = { title: "Password recovery" };

export default function Page() {
  return <AuthRouteScreen mode="forgot-password" supportEmail={getSiteConfig().supportEmail}/>;
}
