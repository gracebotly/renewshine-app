import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cleaning Guides for DC, MD & VA | RenewShine Blog',
  description:
    'Move-out checklists, deep clean guides, pricing breakdowns, and local advice for homeowners and renters in Washington DC, Maryland, and Northern Virginia.',
  alternates: { canonical: '/blog' },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
