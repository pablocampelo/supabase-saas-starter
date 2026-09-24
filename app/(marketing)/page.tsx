import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSiteConfig } from "@/config/site";

export default function Home() {
  const site = getSiteConfig();
  return (
    <main className="mx-auto flex min-h-svh max-w-350 flex-col px-5 py-10 sm:px-8">
      <p className="text-sm font-medium">{site.name}</p>
      <section className="my-auto max-w-2xl py-20" aria-labelledby="page-title">
        <p className="mb-5 text-sm text-muted-foreground">Foundation preview</p>
        <h1 id="page-title" className="text-4xl leading-tight sm:text-6xl">Start with the foundation.</h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">The starting point for your product. Account, subscription, and private data flows are coming in the next implementation phases.</p>
        <Button asChild className="mt-8"><a href={`mailto:${site.supportEmail}`}>Contact support<ArrowUpRight aria-hidden="true" /></a></Button>
      </section>
    </main>
  );
}
