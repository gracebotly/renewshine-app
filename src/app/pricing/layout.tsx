import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'House Cleaning Prices in DC, MD & VA | RenewShine',
  description:
    "See what's included in Standard Cleaning (from $200), Deep Cleaning (from $400), and Move-Out Cleaning (from $500). All quotes confirmed after photo review — no hidden fees.",
  alternates: {
    canonical: '/pricing',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
