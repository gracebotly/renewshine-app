import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { CheckCircle, MapPin, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CITIES, getCityBySlug } from '@/lib/cities'

export async function generateStaticParams() {
  return CITIES.map((city) => ({ city: city.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>
}): Promise<Metadata> {
  const { city: slug } = await params
  const city = getCityBySlug(slug)
  if (!city) return {}

  return {
    title: city.metaTitle,
    description: city.metaDescription,
    keywords: [
      `house cleaning ${city.name}`,
      `maid service ${city.name}`,
      `cleaning service ${city.name}`,
      `deep cleaning ${city.name}`,
      `move out cleaning ${city.name}`,
    ],
    alternates: {
      canonical: `/locations/${city.slug}`,
    },
    openGraph: {
      title: city.metaTitle,
      description: city.metaDescription,
      url: `/locations/${city.slug}`,
      siteName: 'RenewShine',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: city.metaTitle,
      description: city.metaDescription,
    },
  }
}

const serviceTiers = [
  {
    title: 'Standard Clean',
    tagline: 'Regular maintenance for already-tidy homes',
    items: [
      'Dust all surfaces, furniture & picture frames',
      'Scrub & disinfect kitchen + bathrooms',
      'Vacuum furniture, upholstery & all floors',
      'Sweep, vacuum & mop hard floors',
      'Make beds with existing linens',
      'Dust light fixtures, fans, blinds & baseboards',
    ],
    buttonVariant: 'outline' as const,
  },
  {
    title: 'Deep Clean',
    tagline: 'Full reset — every surface, every corner',
    popular: true,
    items: [
      'Everything in Standard Clean, plus:',
      'Remove grease buildup & clean vent hood',
      'Hard water stains, lime scale & soap scum removed',
      'Under & behind accessible furniture',
      'Vents dusted, cobwebs removed',
      'Baseboards & light switches wet wiped',
    ],
    buttonVariant: 'default' as const,
  },
  {
    title: 'Move-In / Move-Out',
    tagline: 'Vacant properties & tenant turnover',
    items: [
      'Everything in Deep Clean, plus:',
      'Inside all cabinets, cupboards & closets',
      'Inside refrigerator & oven (included)',
      'Spot clean walls in kitchen & bathrooms',
      'Vacuum edges of carpet',
    ],
    note: 'Always quoted after photo review — every property is different.',
    buttonVariant: 'outline' as const,
  },
]

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>
}) {
  const { city: slug } = await params
  const city = getCityBySlug(slug)

  if (!city) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        name: 'RenewShine',
        description: city.metaDescription,
        url: `https://renewshine.co/locations/${city.slug}`,
        email: 'hello@renewshine.co',
        areaServed: {
          '@type': 'City',
          name: city.displayName,
        },
        serviceType: 'Residential Cleaning Service',
        priceRange: '$$',
        image: 'https://renewshine.co/og-image.png',
      },
      {
        '@type': 'FAQPage',
        mainEntity: city.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-white border-b border-slate-200 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={15} className="text-(--color-brand)" />
            <Link
              href="/locations"
              className="text-sm text-slate-500 hover:text-(--color-brand) transition-colors duration-200"
            >
              All Locations
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm text-slate-700 font-medium">{city.displayName}</span>
          </div>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-brand-muted) px-3 py-1 text-xs font-semibold uppercase tracking-wide text-(--color-brand) mb-4">
              Premium Cleaning · {city.displayName}
            </span>
            <h1 className="font-display text-4xl font-bold text-slate-900 md:text-5xl">{city.h1}</h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-2xl">{city.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/booking">Get a Quote</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">See Pricing</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-5 text-sm text-slate-600">
              {['Insured & background checked', 'Fast, personal response', 'No payment until you approve'].map(
                (item) => (
                  <div key={item} className="inline-flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span>{item}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--color-brand)">
              Where we clean in {city.name}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">Neighborhoods we serve</h2>
            <p className="mt-2 text-slate-600">{city.housingNote}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {city.neighborhoods.map((n) => (
              <div
                key={n}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                {n}
              </div>
            ))}
            <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-slate-300 bg-white px-4 py-2 text-sm text-slate-500">
              + surrounding areas
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--color-brand)">Services</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">
              Cleaning services in {city.displayName}
            </h2>
            <p className="mt-3 text-slate-600">
              Every quote confirmed after we review your photos — before you pay anything.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {serviceTiers.map((tier) => (
              <Card
                key={tier.title}
                className={tier.popular ? 'border-(--color-brand) border-2 shadow-(--shadow-card-hover)' : ''}
              >
                <CardHeader>
                  {tier.popular ? <Badge variant="popular">Most Popular</Badge> : null}
                  <CardTitle className="mt-3">{tier.title}</CardTitle>
                  <CardDescription>{tier.tagline}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {tier.note ? <p className="mt-4 text-xs italic text-slate-600">{tier.note}</p> : null}
                </CardContent>
                <CardFooter>
                  <Button asChild variant={tier.buttonVariant} className="w-full">
                    <Link href="/booking">Get a Quote</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center gap-0.5 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <blockquote className="font-display text-xl font-medium text-slate-900 leading-relaxed">
            &ldquo;{city.testimonial.quote}&rdquo;
          </blockquote>
          <p className="mt-4 text-sm font-semibold text-slate-900">— {city.testimonial.name}</p>
          <p className="text-sm text-slate-600">{city.testimonial.location}</p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--color-brand)">FAQ</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Questions about cleaning in {city.displayName}
            </h2>
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {city.faqs.map((faq) => (
              <div key={faq.question} className="py-5">
                <p className="font-semibold text-slate-900 mb-2">{faq.question}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-(--color-brand) py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white">Ready for a clean in {city.displayName}?</h2>
          <p className="mx-auto mt-3 max-w-md text-lg text-white/80">
            Submit your details and photos. We review your space and send you a confirmed price as soon as possible — before you pay anything.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-white text-(--color-brand) hover:bg-slate-100">
              <Link href="/booking">Get Your Quote</Link>
            </Button>
            <Button asChild variant="brand-outline" className="border-white/40 text-white hover:bg-white/10">
              <Link href="/pricing">See Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
