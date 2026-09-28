import Link from "next/link";
import { PageHeader } from "@/components/shared/patterns";
import { Button } from "@/components/ui/button";
export default function NotFound(){return <><PageHeader title="Note not found" description="This sample note doesn’t exist. Choose another note from the list."/><Button asChild variant="outline"><Link href="/app/notes">Back to Notes</Link></Button></>;}
