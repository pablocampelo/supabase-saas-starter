import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/patterns";
export default function Layout({children}:{children:React.ReactNode}) {return <Suspense fallback={<div className="mx-auto max-w-md px-6 py-20"><PageSkeleton/></div>}>{children}</Suspense>;}
