import Link from 'next/link'
import type { Metadata } from 'next'
import { MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CITIES } from '@/lib/cities'

export const metadata: Metadata = {
  title: 'House Cleaning Locations in DC, MD & VA | RenewShine',
  description:
    'RenewShine provides premium house cleaning across Washington DC, Maryland, and Northern Virginia. See all cities we serve in the DMV area.',
  alternates: {
    canonical: '/locations',
  },
}

export default function LocationsPage() {
  const maryland = CITIES.filter((c) => c.state === 'MD')
  const virginia = CITIES.filter((c) => c.state === 'VA')
  const dc = CITIES.filter((c) => c.state === 'DC')

  return (
    <>
      <section className="bg-white border-b border-slate-200 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-brand-muted) px-3 py-1 text-xs font-semibold uppercase tracking-wide text-(--color-brand) mb-4">
            Service Areas
          </span>
          <h1 className="font-display text-4xl font-bold text-slate-900">Serving the DMV Area</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
            Premium, photo-reviewed cleaning across Washington DC, Maryland, and Northern Virginia.
            Select your city to see neighborhoods, services, and local details.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {dc.length > 0 && (
            <div className="mb-12">
              <h2 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-(--color-brand)" />
                Washington DC
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dc.map((city) => (
                  <CityCard key={city.slug} city={city} />
                ))}
              </div>
            </div>
          )}

          <div className="mb-12">
            <h2 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-(--color-brand)" />
              Maryland
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {maryland.map((city) => (
                <CityCard key={city.slug} city={city} />
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-(--color-brand)" />
              Northern Virginia
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {virginia.map((city) => (
                <CityCard key={city.slug} city={city} />
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-500">
            Don&apos;t see your city?{' '}
            <Link
              href="/booking"
              className="font-medium text-(--color-brand) underline underline-offset-2"
            >
              Contact us
            </Link>{' '}
            — we may still be able to help.
          </p>
        </div>
      </section>

      <section className="bg-(--color-brand) py-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-3 text-white/80">
            Submit your details. We review your space promptly and confirm your price before you pay.
          </p>
          <div className="mt-6">
            <Button asChild className="bg-white text-(--color-brand) hover:bg-slate-100">
              <Link href="/booking">Get a Quote</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

function CityCard({ city }: { city: import('@/lib/cities').CityData }) {
  return (
    <Link
      href={`/locations/${city.slug}`}
      className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-(--shadow-card) hover:border-slate-300 hover:shadow-(--shadow-card-hover) transition-colors duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--color-brand-muted)">
          <MapPin size={15} className="text-(--color-brand)" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{city.displayName}</p>
          <p className="text-xs text-slate-500">{city.neighborhoods.slice(0, 2).join(', ')} & more</p>
        </div>
      </div>
      <ArrowRight
        size={15}
        className="text-slate-400 group-hover:text-(--color-brand) transition-colors duration-200"
      />
    </Link>
  )
}
