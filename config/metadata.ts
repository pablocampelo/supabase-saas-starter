import type { Metadata } from "next";
import { productConfig } from "./product";
export function publicMetadata(title:string, description:string, path:string):Metadata {
  return { title, description, alternates:{canonical:path}, openGraph:{title:`${title} | ${productConfig.name}`,description,url:path,siteName:productConfig.name,type:"website"} };
}
