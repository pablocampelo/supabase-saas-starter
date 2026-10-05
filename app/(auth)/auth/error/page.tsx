import { AuthRouteScreen } from "@/components/auth/auth-route-screen";
import { getSiteConfig } from "@/config/site";

export const metadata = { title: "Account access error" };

export default function Page() {
  return <AuthRouteScreen mode="error" supportEmail={getSiteConfig().supportEmail}/>;
}
