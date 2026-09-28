"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Plus, Trash2 } from "lucide-react";
import { useAppUi } from "./app-shell";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState, Notice, PageHeader } from "@/components/shared/patterns";
import { previewAction } from "@/lib/ui/actions";
import { displayDate } from "@/lib/ui/presentation";
import type { ExampleResourceViewModel } from "@/lib/ui/models";

function DeleteExample({ example }: { example: ExampleResourceViewModel }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  return <><Button variant="ghost" size="sm" aria-label={`Delete ${example.title}`} onClick={() => setOpen(true)}><Trash2 aria-hidden="true"/><span className="hidden sm:inline">Delete</span></Button><Dialog open={open} onClose={() => setOpen(false)} title="Delete resource?" description="This action cannot be undone."><p className="mb-5 break-words text-sm text-muted-foreground">“{example.title}” will be permanently deleted.</p><div className="flex flex-wrap justify-end gap-3"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button variant="destructive" onClick={async () => { setMessage((await previewAction("delete-example")).message); setOpen(false); }}>Delete resource</Button></div></Dialog>{message && <div className="basis-full"><Notice>{message}</Notice></div>}</>;
}

export function ExampleList() {
  const { app, href } = useAppUi();
  const canWrite = app.entitlements.canCreateExample;
  return <><PageHeader title="Example" description="The replaceable private-resource boundary for ownership, RLS, Pro gating, and CRUD." action={canWrite ? <Button asChild><Link href={href("/app/example/new")}><Plus aria-hidden="true"/>New resource</Link></Button> : undefined}/>{!canWrite && app.examples.length > 0 && <div className="mb-6"><Notice tone="info">You can read and delete retained own resources. <Link className="text-link" href={href("/app/billing")}>Upgrade to Pro to create and edit.</Link></Notice></div>}{app.examples.length ? <ul className="divide-y rounded-lg border px-5">{app.examples.map(example => <li key={example.id} className="flex flex-wrap items-center gap-3 py-5"><FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true"/><Link href={href(`/app/example/${example.id}`)} className="min-w-0 flex-1 rounded-sm"><h2 className="truncate font-sans text-sm font-medium">{example.title}</h2><p className="mt-2 text-xs text-muted-foreground">Updated {displayDate(example.updatedAt)}</p></Link><DeleteExample example={example}/></li>)}</ul> : <EmptyState title="No Example resources yet" action={<Button asChild><Link href={href(canWrite ? "/app/example/new" : "/app/billing")}>{canWrite ? "New resource" : "View Pro"}</Link></Button>}>{canWrite ? "Create a simple resource to exercise the foundation." : "Creating and editing the Example Resource requires Pro."}</EmptyState>}<p className="mt-6 text-xs leading-6 text-muted-foreground">This resource is deliberately small and replaceable. Your real product domain should be able to replace it without changing Auth, Billing, Account, configuration, or the app shell.</p></>;
}

export function ExampleDetail({ id }: { id: string }) {
  const { app, href } = useAppUi();
  const example = app.examples.find(item => item.id === id);
  const isNew = id === "new";
  const canWrite = isNew ? app.entitlements.canCreateExample : app.entitlements.canEditExample;
  const [title, setTitle] = useState(example?.title ?? "");
  const [content, setContent] = useState(example?.content ?? "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    if (!title.trim()) { setError("Enter a title for this resource."); return; }
    setError("");
    setMessage((await previewAction("save-example")).message);
  }

  return <><Link className="text-link mb-7 inline-flex items-center gap-2" href={href("/app/example")}><ArrowLeft className="size-4" aria-hidden="true"/>Back to Example</Link>{!isNew && !example ? <><PageHeader title="Resource unavailable" description="Choose another resource."/><EmptyState title="No resource to display">This resource isn’t available to the current account.</EmptyState></> : isNew && !canWrite ? <><PageHeader title="New resource" description="Creating the Example Resource requires Pro."/><EmptyState title="Upgrade to create" action={<Button asChild><Link href={href("/app/billing")}>View Pro</Link></Button>}>Free keeps retained own resources readable and deletable.</EmptyState></> : <><PageHeader title={isNew ? "New resource" : canWrite ? "Edit resource" : "Read resource"} description={canWrite ? "A minimal title/content resource for exercising the product boundary." : "Your retained resource remains available to read and delete."} action={example && <DeleteExample example={example}/>}/>{canWrite ? <form onSubmit={save} noValidate className="space-y-6"><label className="field" htmlFor="example-title"><span id="example-title-label">Title</span><input aria-labelledby="example-title-label" id="example-title" maxLength={200} value={title} onChange={event => setTitle(event.target.value)} aria-invalid={!!error} aria-describedby={error ? "title-error" : undefined}/>{error && <span id="title-error" className="field-error" role="alert">{error}</span>}</label><label className="field" htmlFor="example-content">Content<textarea id="example-content" value={content} onChange={event => setContent(event.target.value)} className="min-h-72 resize-y"/></label><div className="flex flex-wrap gap-3"><Button type="submit">Save resource</Button><Button asChild variant="outline"><Link href={href("/app/example")}>Cancel</Link></Button></div>{message && <Notice>{message}</Notice>}</form> : <div className="space-y-6"><article className="rounded-lg border p-6"><h2 className="break-words text-2xl">{example?.title}</h2><p className="mt-5 whitespace-pre-wrap break-words text-sm leading-8 text-muted-foreground">{example?.content}</p></article><Button asChild variant="outline"><Link href={href("/app/billing")}>Upgrade to edit</Link></Button></div>}</>}</>;
}
