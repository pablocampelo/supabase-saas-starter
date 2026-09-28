"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

// Native modal dialog supplies focus containment, Escape, inert background, and
// focus return. Kept small; tests exercise drawer and confirmation keyboard use.
export function Dialog({ open, onClose, title, description, children, drawer = false }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; drawer?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  return <dialog ref={ref} onKeyDown={event => {
    if(event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled),textarea:not(:disabled),[tabindex="0"]'));
    const first = controls[0]; const last = controls.at(-1);
    if(event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if(!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onCancel={onClose} onClose={onClose} aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-description` : undefined} className={cn("fixed max-h-[90svh] overflow-y-auto border bg-background p-6 text-foreground backdrop:bg-foreground/30", drawer ? "inset-y-0 left-0 right-auto m-0 h-svh max-h-svh w-80 max-w-[90vw] rounded-none" : "inset-0 m-auto w-[calc(100%_-_2rem)] max-w-md rounded-lg shadow-sm")}>
    <div className="flex items-start justify-between gap-4"><h2 id={`${id}-title`} className="text-xl">{title}</h2><Button variant="ghost" size="sm" aria-label="Close dialog" onClick={onClose}><X aria-hidden="true"/></Button></div>
    {description ? <p id={`${id}-description`} className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p> : null}
    <div className="mt-6">{children}</div>
  </dialog>;
}
