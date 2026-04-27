import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | RenewShine',
  description: 'RenewShine terms of service, booking policy, deposit terms, and cancellation policy.',
}

export default function TermsPage() {
  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-(--color-brand)">Legal</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-slate-900">Terms of Service</h1>
          <p className="mt-3 text-slate-600">Last updated: April 2026</p>
        </div>

        <div className="space-y-8">

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">1. Agreement to Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              By submitting a booking request through renewshine.co, you agree to these
              Terms of Service. These terms apply to all customers in the DMV area
              (Washington DC, Maryland, and Northern Virginia).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">2. The Booking Process</h2>
            <ol className="space-y-3 text-slate-600">
              {[
                'You submit a booking request with photos or a video of your space, along with your contact details and scheduling preferences.',
                'We review your submission and provide a confirmed price and available date within 24 hours.',
                'If you agree to the confirmed price, you pay a $100 deposit via the secure Stripe link we send you.',
                'Your appointment is confirmed only after your $100 deposit is received. Submitting a booking request does not reserve a date.',
                'The remaining balance (total price minus $100 deposit) is due after the cleaning is completed.',
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--color-brand-muted) text-xs font-bold text-(--color-brand)">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">3. Pricing</h2>
            <p className="text-slate-600 leading-relaxed">
              Prices shown during booking are estimates only. Your final confirmed price
              is communicated to you before any payment is requested. You are never
              charged without first approving a confirmed price.
            </p>
          </section>

          <section className="rounded-xl border-2 border-(--color-brand) bg-(--color-brand-muted) p-6">
            <h2 className="font-display text-xl font-bold text-slate-900 mb-4">4. Cancellation & Deposit Policy</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              By paying the $100 deposit, you acknowledge and agree to the following:
            </p>

            <div className="space-y-4">

              <div className="rounded-lg bg-white border border-slate-200 p-4">
                <p className="font-semibold text-slate-900 mb-1">Booking not confirmed until deposit is received</p>
                <p className="text-sm text-slate-600">
                  Submitting a booking request does not create a confirmed appointment.
                  Your appointment is only confirmed after your $100 deposit is
                  successfully processed.
                </p>
              </div>

              <div className="rounded-lg bg-white border border-emerald-100 p-4">
                <p className="font-semibold text-slate-900 mb-1">
                  Cancel more than 24 hours before your appointment → full refund
                </p>
                <p className="text-sm text-slate-600">
                  If you cancel more than 24 hours before your scheduled appointment,
                  your <strong>full $100 deposit is refunded</strong>. Refunds are
                  processed within 5–7 business days.
                </p>
              </div>

              <div className="rounded-lg bg-white border border-amber-100 p-4">
                <p className="font-semibold text-slate-900 mb-1">
                  Cancel within 24 hours of your appointment → deposit held as credit
                </p>
                <p className="text-sm text-slate-600">
                  If you cancel within 24 hours of your appointment time, your $100
                  deposit is <strong>held as a credit</strong> toward a future cleaning.
                  You also receive one (1) free reschedule. The credit is valid for{' '}
                  <strong>30 days</strong> from the cancellation date. If you do not
                  rebook within 30 days, the deposit is forfeited.
                </p>
              </div>

              <div className="rounded-lg bg-white border border-slate-200 p-4">
                <p className="font-semibold text-slate-900 mb-1">If RenewShine cancels your appointment</p>
                <p className="text-sm text-slate-600">
                  If we cancel a confirmed appointment for any reason, your full $100
                  deposit is refunded within 5–7 business days. No cancellation fee
                  applies to you.
                </p>
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-500">
              To cancel or reschedule, email{' '}
              <a href="mailto:hello@renewshine.co" className="text-(--color-brand) underline underline-offset-2">
                hello@renewshine.co
              </a>{' '}
              with your name and appointment date. Cancellation timing is based on
              when we receive your email.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">5. What We Clean (and Don&apos;t Clean)</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              See our{' '}
              <Link href="/pricing" className="text-(--color-brand) underline underline-offset-2">
                Pricing page
              </Link>{' '}
              for full details. The following are excluded from all service tiers:
            </p>
            <ul className="space-y-2 text-slate-600 text-sm">
              {[
                'Extreme clutter or hoarding situations',
                'Mold, biohazards, or hazardous materials of any kind',
                'Animal litter cleaning',
                'Lifting or moving items over 50 lbs',
                'High-reach areas above a 3-step ladder',
                'Exterior windows or exterior of property',
                'Light bulb replacement',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-red-400 font-bold shrink-0">×</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">6. Satisfaction Guarantee</h2>
            <p className="text-slate-600 leading-relaxed">
              If you are not satisfied with your clean, contact us within 24 hours and
              describe the issue. We will make it right at no additional charge.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">7. Access to Your Property</h2>
            <p className="text-slate-600 leading-relaxed">
              You are responsible for providing safe and accessible entry at the
              confirmed appointment time. If our cleaner cannot access the property
              through no fault of RenewShine, the within-24-hours cancellation
              policy in Section 4 applies.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">8. Liability</h2>
            <p className="text-slate-600 leading-relaxed">
              RenewShine is fully insured. If damage occurs during a cleaning caused
              by our team, notify us within 24 hours with photos and a description.
              We will work with you and our insurance carrier to resolve it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">9. Governing Law</h2>
            <p className="text-slate-600 leading-relaxed">
              These Terms are governed by the laws of the State of Maryland.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">10. Contact</h2>
            <p className="text-slate-600 leading-relaxed">
              Questions? Email{' '}
              <a href="mailto:hello@renewshine.co" className="text-(--color-brand) underline underline-offset-2">
                hello@renewshine.co
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">11. SMS Communications</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              By submitting your phone number through our booking form, you agree to
              receive SMS (text) messages from RenewShine related to your booking and
              service. These messages may include:
            </p>
            <ul className="space-y-2 text-slate-600 text-sm mb-4">
              {[
                'Appointment confirmations and reminders',
                'Quote follow-ups',
                'Service updates and notifications',
                'Payment-related messages',
                'Customer satisfaction and review requests',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-(--color-brand) font-bold shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-slate-600 leading-relaxed mb-3">
              Message frequency varies. Message and data rates may apply.
            </p>
            <p className="text-slate-600 leading-relaxed mb-3">
              You can opt out at any time by replying{' '}
              <strong className="text-slate-900">STOP</strong>. For assistance, reply{' '}
              <strong className="text-slate-900">HELP</strong> or email{' '}
              <a
                href="mailto:hello@renewshine.co"
                className="text-(--color-brand) underline underline-offset-2"
              >
                hello@renewshine.co
              </a>.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Consent to receive SMS messages is not a condition of purchase.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
