import type { Metadata } from 'next'
import { BookingForm } from '@/components/booking/BookingForm'

export const metadata: Metadata = {
  title: 'Get a Quote — RenewShine',
  description: 'Submit your details and photos. Quote confirmed within 1–4 hours.',
}

export default function BookingPage() {
  return (
    // Fill the space below the sticky navbar (h-16 = 64px) to the bottom of the viewport.
    // overflow-hidden prevents the page itself from scrolling — the wizard scrolls internally.
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 64px)' }}>
      <BookingForm />
    </div>
  )
}
