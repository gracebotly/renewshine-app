import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { ChevronLeft, Mail, Phone } from 'lucide-react'
import { notFound } from 'next/navigation'
import { QuoteCard } from '@/components/admin/QuoteCard'

function EditableFields({ job }: { job: any }) {
  async function saveDetails(formData: FormData) {
    'use server'
    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const address = String(formData.get('address') ?? '')
    const notes = String(formData.get('notes') ?? '')

    await supabase
      .from('jobs')
      .update({ address, notes })
      .eq('id', job.id)
  }

  return (
    <form action={saveDetails} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="font-semibold text-slate-900">Edit Job Details</h3>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-900">Address</span>
        <input
          type="text"
          name="address"
          defaultValue={job.address ?? ''}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:ring-offset-0"
          placeholder="Service address"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-900">Notes</span>
        <textarea
          name="notes"
          defaultValue={job.notes ?? ''}
          rows={3}
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:ring-offset-0"
          placeholder="Internal notes visible only to you…"
        />
      </label>
      <button
        type="submit"
        className="cursor-pointer rounded-lg bg-(--color-brand) px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-(--color-brand-hover)"
      >
        Save Changes
      </button>
    </form>
  )
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createServerClient()
  const { id } = await params
  const { data: job } = await supabase
    .from('jobs')
    .select('*, job_media(id, file_url, file_type)')
    .eq('id', id)
    .single()

  if (!job) notFound()

  const rawMedia: Array<{ id: string; file_url: string; file_type: string }> =
    job.job_media ?? []

  // Generate signed URLs for private bucket media.
  // Old rows may contain full public URLs (starts with 'http') — use as-is.
  // New rows contain a storage path — generate a 1-hour signed URL.
  const media = await Promise.all(
    rawMedia.map(async (m) => {
      if (m.file_url.startsWith('http')) {
        return m // Legacy public URL — serve directly
      }
      const { data } = await supabase.storage
        .from('job-media')
        .createSignedUrl(m.file_url, 3600)
      return {
        ...m,
        file_url: data?.signedUrl ?? m.file_url,
      }
    })
  )

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

              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                <a
                  href={`mailto:${job.client_email}`}
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50"
                >
                  <Mail size={14} />
                  Email Client
                </a>
                {job.client_phone && (
                  <a
                    href={`tel:${job.client_phone}`}
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50"
                  >
                    <Phone size={14} />
                    Call Client
                  </a>
                )}
              </div>
            </div>

            <EditableFields job={job} />

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">Activity Timeline</h3>
              <div className="space-y-3">
                {[
                  {
                    label: 'Request submitted',
                    timestamp: job.created_at,
                    color: 'bg-slate-400',
                    show: true,
                  },
                  {
                    label: 'Marked under review',
                    timestamp:
                      job.status === 'under_review' ||
                      job.status === 'approved' ||
                      job.status === 'scheduled' ||
                      job.status === 'completed'
                        ? job.created_at
                        : null,
                    color: 'bg-amber-400',
                    show: job.status !== 'new' && job.status !== 'cancelled',
                  },
                  {
                    label: 'Quote approved & sent',
                    timestamp: job.confirmed_date,
                    color: 'bg-(--color-brand)',
                    show:
                      !!job.stripe_payment_link ||
                      job.status === 'approved' ||
                      job.status === 'scheduled' ||
                      job.status === 'completed',
                  },
                  {
                    label: 'Deposit paid — job scheduled',
                    timestamp: job.deposit_paid ? job.confirmed_date : null,
                    color: 'bg-emerald-500',
                    show: job.deposit_paid,
                  },
                  {
                    label: 'Job completed',
                    timestamp: job.status === 'completed' ? job.confirmed_date : null,
                    color: 'bg-emerald-700',
                    show: job.status === 'completed',
                  },
                  {
                    label: 'Request declined',
                    timestamp: job.status === 'cancelled' ? job.created_at : null,
                    color: 'bg-red-400',
                    show: job.status === 'cancelled',
                  },
                ]
                  .filter((item) => item.show)
                  .map((item, i, arr) => (
                    <div key={item.label} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.color}`} />
                        {i < arr.length - 1 && <div className="mt-1 w-px flex-1 bg-slate-200" />}
                      </div>
                      <div className="pb-3">
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        {item.timestamp && (
                          <p className="text-xs text-slate-500">
                            {new Date(item.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
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

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">Payment Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex gap-4">
                  <dt className="w-32 shrink-0 text-slate-500">Deposit status</dt>
                  <dd className={`font-medium ${job.deposit_paid ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {job.deposit_paid ? '✓ Paid' : '✗ Pending'}
                  </dd>
                </div>
                {job.approved_price && (
                  <div className="flex gap-4">
                    <dt className="w-32 shrink-0 text-slate-500">Total approved</dt>
                    <dd className="font-mono tabular-nums font-medium text-slate-900">
                      ${Number(job.approved_price).toFixed(2)}
                    </dd>
                  </div>
                )}
                {job.deposit_paid && (
                  <div className="flex gap-4">
                    <dt className="w-32 shrink-0 text-slate-500">Deposit paid</dt>
                    <dd className="font-mono tabular-nums text-slate-900">$100.00</dd>
                  </div>
                )}
                {job.remaining_amount != null && (
                  <div className="flex gap-4">
                    <dt className="w-32 shrink-0 text-slate-500">Remaining</dt>
                    <dd className="font-mono tabular-nums font-medium text-slate-900">
                      ${Number(job.remaining_amount).toFixed(2)}
                    </dd>
                  </div>
                )}
                {job.stripe_payment_link && (
                  <div className="flex gap-4">
                    <dt className="w-32 shrink-0 text-slate-500">Payment link</dt>
                    <dd>
                      <a
                        href={job.stripe_payment_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer break-all text-xs text-(--color-brand) hover:underline"
                      >
                        View link ↗
                      </a>
                    </dd>
                  </div>
                )}
                {job.stripe_session_id && (
                  <div className="flex gap-4">
                    <dt className="w-32 shrink-0 text-slate-500">Stripe session</dt>
                    <dd className="break-all font-mono text-xs text-slate-600">{job.stripe_session_id}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
