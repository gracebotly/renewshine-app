import { createClient } from '@supabase/supabase-js'
import { JobsTable } from '@/components/admin/JobsTable'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminPage() {
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-slate-600">Manage bookings and quote requests.</p>
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
