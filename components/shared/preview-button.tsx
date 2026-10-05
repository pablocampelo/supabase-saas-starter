"use client";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "./patterns";
import { previewAction } from "@/lib/ui/actions";
import type { UiAction } from "@/lib/ui/models";

export function PreviewButton({ action, children, variant = "outline" }: { action: UiAction; children: ReactNode; variant?: "default" | "outline" | "destructive" }) {
  const [message, setMessage] = useState("");
  return <div className="space-y-3"><Button variant={variant} onClick={async () => setMessage((await previewAction(action)).message)}>{children}</Button>{message ? <Notice>{message}</Notice> : null}</div>;
}
