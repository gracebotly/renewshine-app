export default function Loading() {
  return (
    <div className="min-h-[60vh] bg-white px-4 py-20 animate-pulse">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-8 w-48 rounded-lg bg-slate-100" />
        <div className="h-4 w-full max-w-lg rounded-lg bg-slate-100" />
        <div className="h-4 w-full max-w-sm rounded-lg bg-slate-100" />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  )
}
