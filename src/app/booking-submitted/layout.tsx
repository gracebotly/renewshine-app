import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Request Received — RenewShine',
  description: "Your cleaning request has been submitted. We're reviewing your space now and will be in touch as soon as possible.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
}

export default function BookingSubmittedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
