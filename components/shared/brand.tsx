import Link from "next/link";
import Image from "next/image";
import { productConfig } from "@/config/product";

export function Brand({ href = "/", symbolOnly = false }: { href?: string; symbolOnly?: boolean }) {
  return (
    <Link href={href} aria-label={productConfig.name} className="brand inline-flex items-center gap-2.5">
      <Image src="/icon.svg" width={28} height={28} alt="" className="size-7 shrink-0" unoptimized />
      {!symbolOnly && (
        <span className="text-[20px] font-semibold leading-none tracking-[-.02em] text-[#f7f8f8]">
          {productConfig.shortName}
        </span>
      )}
    </Link>
  );
}
