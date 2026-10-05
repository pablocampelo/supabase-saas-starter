"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FolderKanban, Plus, Trash2 } from "lucide-react";
import { useAppUi } from "./app-shell";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Badge, EmptyState, Notice, PageHeader, type NoticeTone } from "@/components/shared/patterns";
import { deleteProjectAction, saveProjectAction } from "@/lib/projects/actions";
import { initialProjectActionState, type ProjectActionState } from "@/lib/projects/state";
import { displayDate } from "@/lib/ui/presentation";
import type { ProjectViewModel } from "@/lib/ui/models";

function tone(state: ProjectActionState): NoticeTone {
  if (state.status === "error") return "danger";
  if (state.status === "success") return "success";
  return "neutral";
}

function DeleteProject({ project }: { project: ProjectViewModel }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(deleteProjectAction, initialProjectActionState);
  return <><Button variant="ghost" size="sm" aria-label={`Delete ${project.title}`} onClick={() => setOpen(true)}><Trash2 aria-hidden="true"/><span className="hidden sm:inline">Delete</span></Button><Dialog open={open} onClose={() => setOpen(false)} title="Delete project?" description="This action cannot be undone."><p className="mb-5 break-words text-sm text-muted-foreground">“{project.title}” will be permanently deleted.</p><div className="flex flex-wrap justify-end gap-3"><Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button><form action={action} onSubmit={() => setOpen(false)}><input type="hidden" name="id" value={project.id}/><Button variant="destructive" type="submit" disabled={pending}>{pending ? "Deleting…" : "Delete project"}</Button></form></div>{state.status === "error" && state.message && <div className="mt-4"><Notice tone="danger">{state.message}</Notice></div>}</Dialog>{!open && state.message && <div className="basis-full"><Notice tone={tone(state)}>{state.message}</Notice></div>}</>;
}

export function ProjectList() {
  const { app, href } = useAppUi();
  const canWrite = app.entitlements.canCreateProject;
  return <><PageHeader title="Projects" description="The adapted private domain for ownership, RLS, Pro gating and CRUD." action={canWrite ? <Button asChild><Link href={href("/app/projects/new")}><Plus aria-hidden="true"/>New project</Link></Button> : undefined}/>{!canWrite && app.projects.length > 0 && <div className="mb-6"><Notice tone="info">You can read and delete retained own projects. <Link className="text-link" href={href("/app/billing")}>Upgrade to Pro to create and edit.</Link></Notice></div>}{app.projects.length ? <ul className="divide-y rounded-lg border px-5">{app.projects.map(project => <li key={project.id} className="flex flex-wrap items-center gap-3 py-5"><FolderKanban className="size-4 shrink-0 text-muted-foreground" aria-hidden="true"/><Link href={href(`/app/projects/${project.id}`)} className="min-w-0 flex-1 rounded-sm"><div className="flex items-center gap-2"><h2 className="truncate font-sans text-sm font-medium">{project.title}</h2><Badge tone={project.status === "active" ? "success" : "neutral"}>{project.status}</Badge></div><p className="mt-2 text-xs text-muted-foreground">Updated {displayDate(project.updatedAt)}</p></Link><DeleteProject project={project}/></li>)}</ul> : <EmptyState title="No projects yet" action={<Button asChild><Link href={href(canWrite ? "/app/projects/new" : "/app/billing")}>{canWrite ? "New project" : "View Pro"}</Link></Button>}>{canWrite ? "Create a project to exercise the adapted domain." : "Creating and editing projects requires Pro."}</EmptyState>}</>;
}

export function ProjectDetail({ id, project: supplied }: { id: string; project?: ProjectViewModel | null }) {
  const { app, href } = useAppUi();
  const project = supplied === undefined ? app.projects.find(item => item.id === id) : supplied;
  const isNew = id === "new";
  const canWrite = isNew ? app.entitlements.canCreateProject : app.entitlements.canEditProject;
  const [title, setTitle] = useState(project?.title ?? "");
  const [content, setContent] = useState(project?.content ?? "");
  const [status, setStatus] = useState<ProjectViewModel["status"]>(project?.status ?? "draft");
  const [state, action, pending] = useActionState(saveProjectAction, initialProjectActionState);

  return <><Link className="text-link mb-7 inline-flex items-center gap-2" href={href("/app/projects")}><ArrowLeft className="size-4" aria-hidden="true"/>Back to Projects</Link>{!isNew && !project ? <><PageHeader title="Project unavailable" description="Choose another project."/><EmptyState title="No project to display">This project isn’t available to the current account.</EmptyState></> : isNew && !canWrite ? <><PageHeader title="New project" description="Creating projects requires Pro."/><EmptyState title="Upgrade to create" action={<Button asChild><Link href={href("/app/billing")}>View Pro</Link></Button>}>Free keeps retained own projects readable and deletable.</EmptyState></> : <><PageHeader title={isNew ? "New project" : canWrite ? "Edit project" : "Read project"} description={canWrite ? "The Projects domain adds a status field without changing the foundation." : "Your retained project remains available to read and delete."} action={project && <DeleteProject project={project}/>}/>{canWrite ? <form action={action} noValidate className="space-y-6"><input type="hidden" name="id" value={id}/><label className="field" htmlFor="project-title">Title<input id="project-title" name="title" required maxLength={200} value={title} onChange={event => setTitle(event.target.value)}/></label><label className="field" htmlFor="project-status">Status<select id="project-status" name="status" value={status} onChange={event => setStatus(event.target.value as ProjectViewModel["status"])}><option value="draft">Draft</option><option value="active">Active</option></select></label><label className="field" htmlFor="project-content">Content<textarea id="project-content" name="content" maxLength={20000} value={content} onChange={event => setContent(event.target.value)} className="min-h-72 resize-y"/></label><div className="flex flex-wrap gap-3"><Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save project"}</Button><Button asChild variant="outline"><Link href={href("/app/projects")}>Cancel</Link></Button></div>{state.message && <Notice tone={tone(state)}>{state.message}</Notice>}</form> : <div className="space-y-6"><article className="rounded-lg border p-6"><div className="mb-4"><Badge tone={project?.status === "active" ? "success" : "neutral"}>{project?.status}</Badge></div><h2 className="break-words text-2xl">{project?.title}</h2><p className="mt-5 whitespace-pre-wrap break-words text-sm leading-8 text-muted-foreground">{project?.content}</p></article><Button asChild variant="outline"><Link href={href("/app/billing")}>Upgrade to edit</Link></Button></div>}</>}</>;
}
