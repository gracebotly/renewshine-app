import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Request Received — RenewShine',
  description: 'Your cleaning request has been submitted. We\'ll confirm your quote within 1–4 hours.',
}

export default function BookingSubmittedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
