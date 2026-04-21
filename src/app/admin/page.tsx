import { createServerClient } from '@/lib/supabase/server'
import { JobsTable, StaleAlert } from '@/components/admin/JobsTable'

export default async function AdminPage() {
  const supabase = createServerClient()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  const allJobs = jobs ?? []

  const counts = {
    total: allJobs.length,
    needsReview: allJobs.filter((j) => j.status === 'new' || j.status === 'under_review').length,
    approved: allJobs.filter((j) => j.status === 'approved').length,
    scheduled: allJobs.filter((j) => j.status === 'scheduled').length,
  }

  const fourHoursAgoDate = new Date()
  fourHoursAgoDate.setHours(fourHoursAgoDate.getHours() - 4)
  const fourHoursAgo = fourHoursAgoDate.toISOString()
  const staleCount = allJobs.filter(
    (j) => j.status === 'new' && j.created_at < fourHoursAgo
  ).length

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <StaleAlert count={staleCount} />

        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="mt-1 text-slate-600">Manage bookings and quote requests.</p>
          </div>
          <a
            href="/admin/templates"
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors duration-200 hover:bg-slate-50"
          >
            SMS Templates
          </a>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Jobs', value: counts.total, highlight: false },
            { label: 'Needs Review', value: counts.needsReview, highlight: counts.needsReview > 0 },
            { label: 'Awaiting Payment', value: counts.approved, highlight: false },
            { label: 'Scheduled', value: counts.scheduled, highlight: false },
          ].map((card) => (
            <div
              key={card.label}
              className={`rounded-xl border bg-white p-5 shadow-sm ${
                card.highlight ? 'border-amber-200 bg-amber-50' : 'border-slate-200'
              }`}
            >
              <p className="font-mono text-2xl font-bold tabular-nums text-slate-900">{card.value}</p>
              <p className="mt-1 text-sm text-slate-600">{card.label}</p>
            </div>
          ))}
        </div>

        <JobsTable jobs={allJobs} />
      </div>
    </div>
  )
}
