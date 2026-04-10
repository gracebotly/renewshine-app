import type { Metadata } from 'next'
import { BookingForm } from '@/components/booking/BookingForm'

export const metadata: Metadata = {
  title: 'Get a Quote — RenewShine',
  description: 'Submit your details and photos. Quote confirmed within 24 hours.',
}

export default function BookingPage() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-(--color-brand)">Step 1 of getting your quote</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">Get Your Quote</h1>
          <p className="mt-3 text-slate-600">
            Submit your details and photos. Quote confirmed within 24 hours. No payment until you approve.
          </p>
        </div>
        <BookingForm />
      </div>
    </section>
  )
}
