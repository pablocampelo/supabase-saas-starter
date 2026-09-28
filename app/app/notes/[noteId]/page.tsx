import { notFound } from "next/navigation";
import { NoteDetail } from "@/components/app/notes";
import { fixtureNoteIds } from "@/lib/ui/fixtures";
export const metadata = { title:"Note" };
export default async function Page({params}: {params:Promise<{noteId:string}>}) { const {noteId} = await params; if(noteId !== "new" && !fixtureNoteIds.includes(noteId)) notFound(); return <NoteDetail key={noteId} id={noteId}/>; }
