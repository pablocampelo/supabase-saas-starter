import { AuthRouteScreen } from "@/components/auth/auth-route-screen";
import { getSiteConfig } from "@/config/site";

export const metadata = { title: "Sign in" };

export default function Page() {
  return <AuthRouteScreen mode="login" supportEmail={getSiteConfig().supportEmail}/>;
}
