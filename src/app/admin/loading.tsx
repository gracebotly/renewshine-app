export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 animate-pulse">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-8 w-48 rounded-lg bg-slate-200" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-200" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 w-full rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  )
}
