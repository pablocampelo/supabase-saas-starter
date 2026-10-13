import Link from "next/link";
import Image from "next/image";
import { productConfig } from "@/config/product";

export function Brand({ href = "/", symbolOnly = false }: { href?: string; symbolOnly?: boolean }) {
  return <Link href={href} aria-label={productConfig.name} className="brand inline-flex items-center gap-2.5 text-base font-semibold tracking-tight"><Image src="/icon.svg" width={28} height={28} alt="" className="size-7 shrink-0" unoptimized/>{!symbolOnly && <span>{productConfig.shortName}</span>}</Link>;
}
