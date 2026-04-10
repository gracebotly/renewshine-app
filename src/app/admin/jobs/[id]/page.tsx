import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { QuoteCard } from '@/components/admin/QuoteCard'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: job } = await supabase
    .from('jobs')
    .select('*, job_media(id, file_url, file_type)')
    .eq('id', id)
    .single()

  if (!job) notFound()

  const media = job.job_media ?? []

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="mb-6 inline-flex cursor-pointer items-center gap-1.5 text-sm text-slate-600 transition-colors duration-200 hover:text-slate-900"
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <QuoteCard job={job} />

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">Client Details</h3>
              <dl className="space-y-2 text-sm">
                {[
                  ['Name', job.client_name],
                  ['Email', job.client_email],
                  ['Phone', job.client_phone ?? '—'],
                  ['Address', job.address ?? '—'],
                  ['Type', job.type],
                  ...(job.type === 'commercial'
                    ? [
                        ['Business', job.business_name ?? '—'],
                        ['Sq Footage', job.square_footage ? `${job.square_footage} sq ft` : '—'],
                        ['Condition', job.condition ?? '—'],
                      ]
                    : []),
                  ['Submitted', new Date(job.created_at).toLocaleString()],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex gap-4">
                    <dt className="w-24 shrink-0 text-slate-500">{label}</dt>
                    <dd className="break-all text-slate-900">{value as string}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {job.notes ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-2 font-semibold text-slate-900">Notes</h3>
                <p className="whitespace-pre-wrap text-sm text-slate-700">{job.notes}</p>
              </div>
            ) : null}
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">
                Photos & Videos <span className="ml-1 text-sm font-normal text-slate-500">({media.length})</span>
              </h3>
              {media.length === 0 ? (
                <p className="text-sm text-slate-500">No media uploaded.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {media.map((m: { id: string; file_url: string; file_type: string }) => (
                    <a
                      key={m.id}
                      href={m.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block cursor-pointer overflow-hidden rounded-lg border border-slate-200"
                    >
                      {m.file_type === 'video' ? (
                        <video src={m.file_url} className="h-28 w-full object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.file_url} alt="Job media" className="h-28 w-full object-cover" />
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
