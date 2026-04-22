import { createServerClient } from '@/lib/supabase/server'
import { JobsTable, StaleAlert } from '@/components/admin/JobsTable'
import { LogoutButton } from '@/components/admin/LogoutButton'

export default async function AdminPage() {
  const supabase = createServerClient()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  const allJobs = jobs ?? []

  const counts = {
    total: allJobs.length,
    needsQuote: allJobs.filter((j) => j.status === 'new' || j.status === 'under_review').length,
    quotePending: allJobs.filter((j) => j.status === 'approved').length,
    scheduled: allJobs.filter((j) => j.status === 'scheduled').length,
    completed: allJobs.filter((j) => j.status === 'completed').length,
  }

  const fourHoursAgoDate = new Date()
  fourHoursAgoDate.setHours(fourHoursAgoDate.getHours() - 4)
  const fourHoursAgo = fourHoursAgoDate.toISOString()
  const staleCount = allJobs.filter(
    (j) => (j.status === 'new' || j.status === 'under_review') && j.created_at < fourHoursAgo
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
          <div className="flex shrink-0 items-center gap-2">
            <a
              href="/admin/templates"
              className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-900"
            >
              SMS Templates
            </a>
            <LogoutButton />
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: 'Needs Quote',
              value: counts.needsQuote,
              highlight: counts.needsQuote > 0,
              color: 'border-amber-200 bg-amber-50',
              textColor: 'text-amber-700',
            },
            {
              label: 'Quote Pending',
              value: counts.quotePending,
              highlight: false,
              color: 'border-orange-200 bg-orange-50',
              textColor: 'text-orange-700',
            },
            {
              label: 'Scheduled',
              value: counts.scheduled,
              highlight: false,
              color: 'border-emerald-200 bg-emerald-50',
              textColor: 'text-emerald-700',
            },
            {
              label: 'Completed',
              value: counts.completed,
              highlight: false,
              color: 'border-slate-200 bg-white',
              textColor: 'text-slate-700',
            },
          ].map((card) => (
            <div
              key={card.label}
              className={`rounded-xl border p-5 shadow-sm ${card.color}`}
            >
              <p className={`font-mono text-2xl font-bold tabular-nums ${card.textColor}`}>{card.value}</p>
              <p className="mt-1 text-sm text-slate-600">{card.label}</p>
            </div>
          ))}
        </div>

        <JobsTable jobs={allJobs} />
      </div>
    </div>
  )
}
