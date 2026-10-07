import { createSignupSocialImage } from "./social-image";

export const alt = "SupaSaaS sign up screen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createSignupSocialImage();
}
