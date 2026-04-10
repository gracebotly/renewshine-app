import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — RenewShine',
  description: 'Simple, transparent pricing. Your final price confirmed before you pay a single cent.',
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
