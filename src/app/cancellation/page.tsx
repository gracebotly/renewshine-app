import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cancellation Policy | RenewShine',
  description: 'RenewShine deposit and cancellation policy — what happens if you need to cancel or reschedule your cleaning appointment.',
}

export default function CancellationPage() {
  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-(--color-brand)">Policy</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-slate-900">Cancellation Policy</h1>
          <p className="mt-3 text-slate-600">
            Clear, upfront terms — no surprises. Read this before you pay your deposit.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-(--color-brand) bg-(--color-brand-muted) p-5">
          <div className="flex gap-3">
            <AlertCircle size={18} className="text-(--color-brand) mt-0.5 shrink-0" />
            <p className="text-slate-800 font-medium">
              Your appointment is <strong>not confirmed</strong> until your $100 deposit
              is received. Submitting a booking request does not hold a date.
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          <div className="rounded-xl border border-emerald-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-2">
                  Cancel more than 24 hours before your appointment
                </p>
                <p className="text-sm text-slate-600">
                  Your <strong>full $100 deposit is refunded</strong> — no questions asked.
                  Refunds are processed within 5–7 business days.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50">
                <Clock size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-2">
                  Cancel within 24 hours of your appointment
                </p>
                <ul className="text-sm text-slate-600 space-y-1.5">
                  <li>· Your $100 deposit is <strong>held as a credit</strong> toward a future cleaning.</li>
                  <li>· You receive one (1) free reschedule.</li>
                  <li>· Your credit is valid for <strong>30 days</strong> from the cancellation date.</li>
                  <li>· If you do not rebook within 30 days, the deposit is <strong>forfeited</strong>.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-2">
                  If RenewShine cancels your appointment
                </p>
                <p className="text-sm text-slate-600">
                  Your full $100 deposit is refunded within 5–7 business days.
                  No cancellation fee applies to you.
                </p>
              </div>
            </div>
          </div>

        </div>

        <div className="rounded-xl border border-slate-200 overflow-hidden mb-10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 font-semibold text-slate-900">Scenario</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-900">Your deposit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-5 py-3 text-slate-700">Cancel 24+ hours before</td>
                <td className="px-5 py-3 text-emerald-700 font-medium">Full refund</td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-slate-700">Cancel within 24 hours</td>
                <td className="px-5 py-3 text-amber-700 font-medium">30-day credit + 1 free reschedule</td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-slate-700">Don&apos;t rebook within 30 days</td>
                <td className="px-5 py-3 text-red-600 font-medium">Forfeited</td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-slate-700">RenewShine cancels</td>
                <td className="px-5 py-3 text-emerald-700 font-medium">Full refund</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 mb-10">
          <h2 className="font-semibold text-slate-900 mb-2">How to cancel or reschedule</h2>
          <p className="text-sm text-slate-600">
            Email{' '}
            <a href="mailto:hello@renewshine.co" className="text-(--color-brand) underline underline-offset-2">
              hello@renewshine.co
            </a>{' '}
            with your name and appointment date. Cancellation timing is recorded
            based on when we receive your email.
          </p>
        </div>

        <div className="text-sm text-slate-500 space-y-1">
          <p>
            These terms are part of our full{' '}
            <Link href="/terms" className="text-(--color-brand) underline underline-offset-2">
              Terms of Service
            </Link>.
          </p>
          <p>Last updated: April 2026</p>
        </div>

      </div>
    </div>
  )
}
