import Link from "next/link";
import { Brand } from "@/components/shared/brand";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <main className="site-container max-w-2xl py-16"><Brand/><p className="eyebrow mt-20">404</p><h1 className="mt-4 text-4xl">This page isn’t here.</h1><p className="my-6 text-sm leading-7 text-muted-foreground">The link may have changed, or the requested resource doesn’t exist.</p><div className="flex flex-wrap gap-3"><Button asChild><Link href="/">Back to home</Link></Button><Button asChild variant="outline"><Link href="/app">Open app preview</Link></Button><Button asChild variant="ghost"><Link href="/help">Get help</Link></Button></div></main>;
}
