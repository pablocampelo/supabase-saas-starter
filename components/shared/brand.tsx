import Link from "next/link";
import Image from "next/image";
import { productConfig } from "@/config/product";

export function Brand({ href = "/" }: { href?: string }) {
  return <Link href={href} aria-label={productConfig.name} className="brand inline-flex items-center gap-2 text-sm font-semibold tracking-tight"><Image src="/icon.svg" width={20} height={20} alt="" className="size-5 shrink-0" unoptimized/><span>{productConfig.name}</span></Link>;
}
