import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { QuoteCard } from '@/components/admin/QuoteCard'
import { ADD_ONS } from '@/lib/pricing'

// ── Label/Value row — read-only display ──────────────────────────────────────
function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex min-h-[32px] items-start gap-4 py-1">
      <dt className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="flex-1 text-sm text-slate-900">{value || '—'}</dd>
    </div>
  )
}

// ── Section divider ───────────────────────────────────────────────────────────
function Section({ title }: { title: string }) {
  return (
    <div className="mb-3 mt-6 first:mt-0 flex items-center gap-3">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</p>
      <div className="flex-1 border-t border-slate-100" />
    </div>
  )
}

// ── Inline editable submission form ──────────────────────────────────────────
function SubmissionCard({ job }: { job: any }) {
  async function saveDetails(formData: FormData) {
    'use server'
    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    // Collect checked add-on IDs from checkboxes
    const allAddonIds = ['fridge', 'oven', 'dishes', 'linen', 'laundry', 'windows', 'organization', 'walls', 'basement']
    const selectedAddOns = allAddonIds.filter((id) => formData.get(`addon_${id}`) === 'on')
    await supabase
      .from('jobs')
      .update({
        client_name: String(formData.get('client_name') ?? ''),
        client_phone: String(formData.get('client_phone') ?? '') || null,
        client_email: String(formData.get('client_email') ?? ''),
        address: String(formData.get('address') ?? '') || null,
        bedrooms: Number(formData.get('bedrooms')) || null,
        bathrooms: Number(formData.get('bathrooms')) || null,
        service_type: (String(formData.get('service_type') ?? '') || null) as any,
        service_frequency: String(formData.get('service_frequency') ?? '') || null,
        add_ons: selectedAddOns,
        notes: String(formData.get('notes') ?? '') || null,
      })
      .eq('id', job.id)
    // Reload the page after save so the right panel re-reads updated job data
    const { redirect } = await import('next/navigation')
    redirect(`/admin/jobs/${job.id}`)
  }

  const timePrefMap: Record<string, string> = {
    morning: 'Morning (8am–12pm)',
    afternoon: 'Afternoon (12pm–5pm)',
    early_morning: '8am – 10am',
    mid_morning: '10am – 12pm',
    noon: '12pm – 2pm',
    early_afternoon: '2pm – 4pm',
    late_afternoon: '4pm – 6pm',
    flexible: 'Flexible (Any Time)',
  }

  const frequencyMap: Record<string, string> = {
    one_time: 'One-time',
    weekly: 'Weekly',
    bi_weekly: 'Bi-weekly',
    monthly: 'Monthly',
  }


  const availStr = (() => {
    if (!job.availability_start) return '—'
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      })
    if (job.availability_end && job.availability_end !== job.availability_start) {
      return `${fmt(job.availability_start)} – ${fmt(job.availability_end)}`
    }
    return fmt(job.availability_start)
  })()

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:ring-offset-0'

  return (
    <form
      action={saveDetails}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Booking Submission</h2>
        <button
          type="submit"
          className="cursor-pointer rounded-lg bg-(--color-brand) px-4 py-1.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-(--color-brand-hover)"
        >
          Save
        </button>
      </div>

      <dl>
        {/* ── CONTACT ── */}
        <Section title="Contact" />

        <div className="flex min-h-[32px] items-start gap-4 py-1">
          <dt className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400 pt-2">
            Name
          </dt>
          <dd className="flex-1">
            <input name="client_name" defaultValue={job.client_name ?? ''} className={inputClass} />
          </dd>
        </div>

        <div className="flex min-h-[32px] items-start gap-4 py-1">
          <dt className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400 pt-2">
            Email
          </dt>
          <dd className="flex-1">
            <input name="client_email" type="email" defaultValue={job.client_email ?? ''} className={inputClass} />
          </dd>
        </div>

        <div className="flex min-h-[32px] items-start gap-4 py-1">
          <dt className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400 pt-2">
            Phone
          </dt>
          <dd className="flex-1">
            <input name="client_phone" defaultValue={job.client_phone ?? ''} className={`${inputClass} select-all`} />
          </dd>
        </div>

        <div className="flex min-h-[32px] items-start gap-4 py-1">
          <dt className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400 pt-2">
            Address
          </dt>
          <dd className="flex-1">
            <input name="address" defaultValue={job.address ?? ''} placeholder="Service address" className={inputClass} />
          </dd>
        </div>

        {job.type === 'commercial' && (
          <>
            <Row label="Business" value={job.business_name} />
            <Row label="Sq Footage" value={job.square_footage ? `${job.square_footage} sq ft` : null} />
            <Row label="Condition" value={job.condition} />
          </>
        )}

        {/* ── SERVICE ── */}
        <Section title="Service" />

        <div className="flex min-h-[32px] items-start gap-4 py-1">
          <dt className="w-32 shrink-0 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Type
          </dt>
          <dd className="flex-1">
            <select
              name="service_type"
              defaultValue={job.service_type ?? 'standard'}
              className={inputClass}
            >
              <option value="standard">Standard Clean</option>
              <option value="deep">Deep Clean</option>
              <option value="move_out">Move-In / Move-Out</option>
              <option value="post_construction">Post-Construction</option>
            </select>
          </dd>
        </div>

        {job.service_type !== 'post_construction' && (
          <>
            <div className="flex min-h-[32px] items-start gap-4 py-1">
              <dt className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400 pt-2">
                Bedrooms
              </dt>
              <dd className="flex-1">
                <input name="bedrooms" type="number" min="0" defaultValue={job.bedrooms ?? ''} className={`${inputClass} max-w-[80px]`} />
              </dd>
            </div>

            <div className="flex min-h-[32px] items-start gap-4 py-1">
              <dt className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400 pt-2">
                Bathrooms
              </dt>
              <dd className="flex-1">
                <input name="bathrooms" type="number" min="0" defaultValue={job.bathrooms ?? ''} className={`${inputClass} max-w-[80px]`} />
              </dd>
            </div>
          </>
        )}

        <div className="flex items-start gap-4 py-1">
          <dt className="w-32 shrink-0 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Add-ons
          </dt>
          <dd className="flex-1">
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {ADD_ONS.map((addon) => (
                <label key={addon.id} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name={`addon_${addon.id}`}
                    defaultChecked={Array.isArray(job.add_ons) && job.add_ons.includes(addon.id)}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-(--color-brand) focus:ring-(--color-brand)"
                  />
                  <span className="text-sm text-slate-700">{addon.label}</span>
                </label>
              ))}
            </div>
          </dd>
        </div>

        <div className="flex min-h-[32px] items-start gap-4 py-1">
          <dt className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400 pt-2">
            Frequency
          </dt>
          <dd className="flex-1">
            <select
              name="service_frequency"
              defaultValue={job.service_frequency ?? 'one_time'}
              className={inputClass}
            >
              <option value="one_time">One-time</option>
              <option value="weekly">Weekly</option>
              <option value="bi_weekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </dd>
        </div>

        {/* ── AVAILABILITY ── */}
        <Section title="Availability" />

        <Row label="Window" value={availStr} />
        <Row
          label="Time"
          value={timePrefMap[job.availability_time_pref ?? ''] ?? job.availability_time_pref}
        />

        {/* ── NOTES ── */}
        <Section title="Notes" />

        <div className="flex items-start gap-4 py-1">
          <dt className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400 pt-2">
            Notes
          </dt>
          <dd className="flex-1">
            <textarea
              name="notes"
              defaultValue={job.notes ?? ''}
              rows={3}
              placeholder="Internal notes visible only to you…"
              className={`${inputClass} resize-none`}
            />
          </dd>
        </div>

        {/* ── META ── */}
        <Section title="Meta" />
        <Row label="Submitted" value={new Date(job.created_at).toLocaleString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
          hour: 'numeric', minute: '2-digit',
        })} />
        <Row label="Job Type" value={job.type ?? 'residential'} />
      </dl>
    </form>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createServerClient()
  const { id } = await params
  const { data: job } = await supabase
    .from('jobs')
    .select('*, job_media(id, file_url, file_type)')
    .eq('id', id)
    .single()

  if (!job) notFound()

  const rawMedia: Array<{ id: string; file_url: string; file_type: string | null }> =
    job.job_media ?? []

  // Bucket is PRIVATE — must use createSignedUrl (not getPublicUrl).
  // createSignedUrl is async, so we resolve all in parallel with Promise.all.
  const mediaResults = await Promise.all(
    rawMedia.map(async (m) => {
      // Legacy records stored before path-only migration: file_url is a full http URL
      if (m.file_url.startsWith('http')) return m

      // Strip any residual "|contentType" suffix from old pipe-encoded records
      const cleanPath = m.file_url.includes('|') ? m.file_url.split('|')[0] : m.file_url

      const { data, error } = await supabase.storage
        .from('job-media')
        .createSignedUrl(cleanPath, 60 * 60)

      if (error || !data?.signedUrl) {
        console.error('Failed to create signed URL for job media:', {
          mediaId: m.id,
          path: cleanPath,
          error,
        })
        return null
      }

      return { ...m, file_url: data.signedUrl }
    })
  )
  const media = mediaResults.filter((m): m is NonNullable<typeof m> => Boolean(m))

  const heroMedia = media[0] ?? null
  const thumbMedia = media.slice(1)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="mb-6 inline-flex cursor-pointer items-center gap-1.5 text-sm text-slate-600 transition-colors duration-200 hover:text-slate-900"
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          {/* RIGHT — sticky decision panel */}
          <div className="w-full lg:w-80 xl:w-96 lg:sticky lg:top-8 shrink-0 lg:order-2">
            <QuoteCard job={job} />
          </div>

          {/* LEFT — submission + media + timeline */}
          <div className="flex-1 min-w-0 space-y-6 lg:order-1">

            {/* 1. Submission card — all wizard fields */}
            <SubmissionCard job={job} />

            {/* 2. Photos & Videos */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">
                Photos & Videos
                <span className="ml-2 normal-case font-normal text-slate-400">({media.length})</span>
              </h3>

              {media.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
                  No media uploaded
                </div>
              ) : (
                <div className="space-y-3">
                  {heroMedia && (
                    <a
                      href={heroMedia.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block cursor-pointer overflow-hidden rounded-lg border border-slate-200"
                    >
                      {heroMedia.file_type === 'video' ? (
                        <video
                          className="h-64 w-full object-cover"
                          controls
                          preload="metadata"
                          playsInline
                        >
                          <source src={heroMedia.file_url} type="video/mp4" />
                          <source src={heroMedia.file_url} type="video/quicktime" />
                        </video>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={heroMedia.file_url} alt="Job photo" className="h-64 w-full object-cover" />
                      )}
                    </a>
                  )}
                  {thumbMedia.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {thumbMedia.map((m) => (
                        <a
                          key={m.id}
                          href={m.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block cursor-pointer overflow-hidden rounded-lg border border-slate-200"
                        >
                          {m.file_type === 'video' ? (
                            <video
                              className="h-20 w-full object-cover"
                              preload="metadata"
                              muted
                              playsInline
                            >
                              <source src={m.file_url} type="video/mp4" />
                              <source src={m.file_url} type="video/quicktime" />
                            </video>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.file_url} alt="Job photo" className="h-20 w-full object-cover" />
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Activity Timeline */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">
                Activity Timeline
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: 'Request submitted',
                    timestamp: job.created_at,
                    color: 'bg-slate-300',
                    show: true,
                  },
                  {
                    label: 'Marked under review',
                    timestamp:
                      ['under_review', 'approved', 'scheduled', 'completed'].includes(job.status)
                        ? job.created_at
                        : null,
                    color: 'bg-amber-400',
                    show: !['new', 'cancelled'].includes(job.status),
                  },
                  {
                    label: 'Quote sent',
                    timestamp: job.confirmed_date,
                    color: 'bg-(--color-brand)',
                    show:
                      !!job.stripe_payment_link ||
                      ['approved', 'scheduled', 'completed'].includes(job.status),
                  },
                  {
                    label: 'Deposit paid — scheduled',
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
                    label: 'Declined',
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
                        {i < arr.length - 1 && (
                          <div className="mt-1 w-px flex-1 bg-slate-200" />
                        )}
                      </div>
                      <div className="pb-3">
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        {item.timestamp && (
                          <p className="text-xs text-slate-400">
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
        </div>
      </div>
    </div>
  )
}
