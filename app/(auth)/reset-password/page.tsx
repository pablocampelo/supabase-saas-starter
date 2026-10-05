import { AuthRouteScreen } from "@/components/auth/auth-route-screen";
import { getSiteConfig } from "@/config/site";

export const metadata = { title: "Reset password" };

export default function Page() {
  return <AuthRouteScreen mode="reset-password" supportEmail={getSiteConfig().supportEmail}/>;
}
