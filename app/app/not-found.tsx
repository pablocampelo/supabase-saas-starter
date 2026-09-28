import Link from "next/link";
import { PageHeader } from "@/components/shared/patterns";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <><PageHeader title="Resource not found" description="This sample Example Resource doesn’t exist. Choose another resource from the list."/><Button asChild variant="outline"><Link href="/app/example">Back to Example</Link></Button></>;
}
