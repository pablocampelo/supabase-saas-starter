"use client";
import Link from "next/link";
import { PageHeader, Notice } from "@/components/shared/patterns";
import { Button } from "@/components/ui/button";
export default function ErrorPage({retry}:{error:Error & {digest?:string};retry:()=>void}) {return <div className="space-y-6"><PageHeader title="Unable to display this page" description="Try again, or contact support if this continues."/><Notice danger>No account or billing changes have been confirmed.</Notice><div className="flex flex-wrap gap-3"><Button onClick={retry}>Try again</Button><Button asChild variant="outline"><Link href="/app/help">Contact support</Link></Button></div></div>;}
