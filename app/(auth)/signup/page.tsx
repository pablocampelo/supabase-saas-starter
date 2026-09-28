import { AuthRouteScreen } from "@/components/auth/auth-route-screen";
import { getSiteConfig } from "@/config/site";

export const metadata = { title: "Create an account" };

export default function Page() {
  return <AuthRouteScreen mode="signup" supportEmail={getSiteConfig().supportEmail}/>;
}
