import { AuthRouteScreen } from "@/components/auth/auth-route-screen";
import { getSiteConfig } from "@/config/site";

export const metadata = { title: "Verify your email" };

export default function Page() {
  return <AuthRouteScreen mode="verify-email" supportEmail={getSiteConfig().supportEmail}/>;
}
