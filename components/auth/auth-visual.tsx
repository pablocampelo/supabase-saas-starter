/** Decorative, replaceable auth surface; contains no product data or controls. */
export function AuthVisual() {
  return (
    <div aria-hidden="true" className="relative hidden overflow-hidden border-r bg-muted md:flex md:items-center md:justify-center">
      <div className="absolute inset-x-0 top-1/3 border-t border-border/60" />
      <div className="absolute inset-x-0 bottom-1/3 border-t border-border/60" />
      <div className="absolute inset-y-0 left-1/4 border-l border-border/60" />
      <div className="absolute inset-y-0 right-1/4 border-l border-border/60" />
      <div className="relative w-3/4 max-w-md rounded-lg border bg-background p-5 shadow-sm lg:p-7">
        <div className="flex items-center gap-1.5 border-b pb-5">
          <span className="size-2 rounded-full bg-input" />
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
          <span className="ml-auto h-1.5 w-16 rounded-sm bg-muted" />
        </div>
        <div className="grid grid-cols-[1fr_3fr] gap-5 pt-6 lg:gap-7">
          <div className="space-y-4 border-r pr-4">
            <div className="h-5 w-5 rounded-sm border bg-secondary" />
            <div className="h-1.5 rounded-sm bg-border" />
            <div className="h-1.5 w-3/4 rounded-sm bg-border" />
            <div className="h-1.5 w-2/3 rounded-sm bg-border" />
          </div>
          <div className="space-y-5">
            <div className="h-2 w-2/3 rounded-sm bg-input" />
            <div className="h-1.5 w-full rounded-sm bg-border" />
            <div className="aspect-[4/3] rounded-md border bg-muted/50 p-4">
              <div className="h-full rounded-sm border border-dashed border-input/60" />
            </div>
            <div className="flex gap-3"><div className="h-7 w-1/3 rounded-sm bg-secondary" /><div className="h-7 w-1/4 rounded-sm border" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
