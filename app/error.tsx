"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function ErrorPage({retry}:{error:Error & {digest?:string};retry:()=>void}) {return <main className="site-container max-w-2xl py-20"><h1 className="text-4xl">Something went wrong</h1><p className="my-6 text-sm leading-7 text-muted-foreground">We couldn’t display this page. Try again or contact support. No error details or account information are displayed here.</p><div className="flex gap-3"><Button onClick={retry}>Try again</Button><Button asChild variant="outline"><Link href="/help">Contact support</Link></Button></div></main>;}
