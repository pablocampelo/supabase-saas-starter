import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PreviewNotice({ children, className }: { children: ReactNode; className?: string }) {
  return <div data-preview-notice className={cn("rounded-md border bg-muted/60 px-4 py-3 text-xs leading-5 text-muted-foreground", className)}><strong className="font-medium text-foreground">Integration preview</strong> · {children}</div>;
}
