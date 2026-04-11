import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Booking Confirmed — RenewShine',
  description: 'Your deposit has been received. Your clean is confirmed.',
}

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  const supabase = createServerClient()

  let job = null

  if (session_id) {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('stripe_session_id', session_id)
      .single()
    job = data
  }

  const confirmedDateStr = job?.confirmed_date
    ? new Date(job.confirmed_date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const serviceLabel =
    job?.service_type === 'standard' ? 'Standard Clean'
    : job?.service_type === 'deep' ? 'Deep Clean'
      : job?.service_type === 'move_out' ? 'Move-In / Move-Out'
        : 'Cleaning Service'

  const timePref =
    job?.availability_time_pref === 'morning' ? 'Morning (8am–12pm)'
    : job?.availability_time_pref === 'afternoon' ? 'Afternoon (12pm–5pm)'
      : 'Flexible (Any Time)'

  const remaining = job?.remaining_amount ?? ((job?.approved_price ?? 0) - 100)

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">

          <div className="flex justify-center mb-4">
            <Image src="/logo-mark.svg" alt="RenewShine" width={40} height={40} className="w-10 h-10" />
          </div>
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle size={28} className="text-emerald-500" />
          </div>

          <h1 className="font-display text-2xl font-bold text-slate-900">
            You&apos;re All Set!
          </h1>
          <p className="mt-2 text-slate-600">
            Your deposit has been received and your booking is confirmed.
          </p>

          {job ? (
            <div className="mt-6 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-left">
              {[
                ['Service', serviceLabel],
                ['Date', confirmedDateStr ?? '—'],
                ['Arrival window', timePref],
                ['Address', job.address ?? '—'],
                ['Deposit paid', '$100.00 ✓'],
                ['Remaining balance', `$${Number(remaining).toFixed(2)} (due after clean)`],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="w-36 shrink-0 text-slate-500">{label}</span>
                  <span className="font-medium text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">
              Check your email for your full booking confirmation.
            </p>
          )}

          <div className="mt-8">
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
