import type { Metadata } from 'next'
import { BookingForm } from '@/components/booking/BookingForm'

export const metadata: Metadata = {
  title: 'Get a Quote — RenewShine',
  description: 'Submit your details and photos. We review your space and send a confirmed quote as soon as possible.',
  alternates: {
    canonical: '/booking',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-[#F5F3EF]">
      <BookingForm />
    </main>
  )
}
