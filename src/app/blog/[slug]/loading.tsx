export default function BlogPostLoading() {
  return (
    <div className="bg-white">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-slate-100 rounded w-24" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
          <div className="h-8 bg-slate-100 rounded w-3/4" />
          <div className="h-8 bg-slate-100 rounded w-1/2" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
