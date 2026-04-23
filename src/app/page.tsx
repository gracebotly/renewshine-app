'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import * as Accordion from '@radix-ui/react-accordion'
import {
  AppWindow,
  Bed,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  CheckCircle,
  ChevronDown,
  Clock,
  Flame,
  Home,
  LayoutGrid,
  Layers,
  PaintBucket,
  Refrigerator,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  UtensilsCrossed,
  Wind,
  Wrench,
  WashingMachine,
} from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const steps = [
  {
    icon: Camera,
    title: 'Submit Your Details',
    description:
      'Tell us about your space — a quick video, some photos, or a written description works.',
  },
  {
    icon: Search,
    title: 'We Review & Confirm',
    description:
      'We assess your submission and lock in a realistic price range based on what we see — usually within 1–4 hours.',
  },
  {
    icon: CheckCircle,
    title: 'Approve & Book',
    description:
      "Review your quote and secure your spot. No payment until you're ready.",
  },
  {
    icon: Sparkles,
    title: 'We Handle the Rest',
    description:
      'Your cleaner arrives fully prepared. You pay the remaining balance only after the job is done.',
  },
]

const services = [
  {
    title: 'Standard Clean',
    price: 'From $200',
    tagline: 'Regular maintenance',
    items: [
      'Dust all surfaces, furniture, bookshelves & picture frames',
      'Wipe cabinet fronts, exterior of oven & fridge, and microwave inside & out',
      'Clean stovetop, grates & knobs',
      'Scrub & disinfect kitchen sink, bathroom sink, toilet, shower & bathtub',
      'Vacuum furniture, upholstery & floors — sweep & mop all floors',
      'Make beds with existing linens',
      'Dust light fixtures, ceiling fans, blinds, baseboards & doors',
    ],
    note: 'Recurring clients receive a custom discounted rate. Contact us to discuss a recurring plan.',
    buttonVariant: 'outline' as const,
  },
  {
    title: 'Deep Clean',
    price: 'From $400',
    tagline: 'Full reset. Recommended for first-time clients.',
    items: [
      'Everything in Standard Clean, plus:',
      'Inside oven cleaned',
      'Inside refrigerator cleaned',
      'Remove grease buildup — clean vent hood',
      'Wipe top of refrigerator & accessible cabinets',
      'Remove hard water stains, lime scale, rust & soap scum',
      'Tackle mold & mildew in bathrooms',
      'Clean under & behind accessible furniture',
      'Vents dusted, blinds & sills wiped, cobwebs removed',
      'Doors & baseboards wet wiped — light switches & outlets wet wiped',
    ],
    popular: true,
    buttonVariant: 'default' as const,
  },
  {
    title: 'Move-In / Move-Out',
    price: 'From $500',
    tagline: 'Vacant properties and tenant turnover',
    items: [
      'Everything in Deep Clean, plus:',
      'Inside all cabinets, cupboards & closets',
      'Clean tops of cabinets',
      'Inside refrigerator cleaned',
      'Inside oven cleaned',
      'Spot clean walls in kitchen & bathrooms',
      'Vacuum edges of carpet',
    ],
    note: 'Always quoted after photo review — every property is different.',
    buttonVariant: 'outline' as const,
  },
]

const addOns = [
  { icon: Refrigerator, name: 'Inside Refrigerator' },
  { icon: Flame, name: 'Inside Oven' },
  { icon: UtensilsCrossed, name: 'Dishes (washed or put away)' },
  { icon: Bed, name: 'Change Linens' },
  { icon: WashingMachine, name: 'Single Load of Laundry' },
  { icon: AppWindow, name: 'Interior Windows' },
  { icon: LayoutGrid, name: 'Tidy-Up / Home Organization' },
  { icon: PaintBucket, name: 'Spot Clean Walls' },
  { icon: Layers, name: 'Basement Cleaning' },
]

const faqs = [
  {
    question: 'Do I need to send photos or a video?',
    answer:
      "You don't have to — but it helps us give you a much more accurate estimate. A 60-second walkthrough video of your space is the easiest way to help us understand what the job involves. Photos of each room work too. If you'd rather just describe your space in writing, that's fine — we'll review what you submit and follow up if we need more details before confirming your price.",
  },
  {
    question: 'Do I have to pay before you confirm my price?',
    answer:
      "No. You submit your details and photos at no cost. We review your home and send you a full itemized quote. You only pay a $100 deposit after you've reviewed and approved the confirmed price.",
  },
  {
    question: 'What areas do you serve?',
    answer:
      "We serve communities throughout Maryland, Washington DC, and Northern Virginia — including Washington DC, Arlington, Alexandria, Bethesda, Silver Spring, McLean, Potomac, Rockville, Gaithersburg, and Reston. See our full locations list at renewshine.co/locations. Don't see your city? Reach out — we may still be able to help.",
  },
  {
    question: "What if I'm not satisfied with the clean?",
    answer:
      "We stand behind our work. If something wasn't done to your standard, contact us within 24 hours and we'll make it right at no extra charge.",
  },
  {
    question: 'How long does a clean take?',
    answer:
      "It depends on the size and service type. A standard clean on a 2-bedroom home typically takes 2–3 hours. A deep clean or move-out clean takes longer. We'll confirm estimated time when we send your quote.",
  },
  {
    question: "What's the difference between Standard and Deep Clean?",
    answer:
      "Standard Clean is maintenance cleaning for homes that are regularly kept up — it covers all the essentials. Deep Clean goes further: inside the oven, inside the refrigerator, grease buildup removal, hard water and lime scale treatment, mold and mildew, under and behind furniture, and every detail corner to corner. We recommend Deep Clean for first-time clients or homes that haven't been professionally cleaned recently.",
  },
]

export default function HomePage() {
  return (
    <>
      <section className="bg-white pb-24 pt-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
        <div className="flex justify-center mb-6">
          <Image src="/logo-mark.svg" alt="RenewShine" width={64} height={64} priority className="w-16 h-16" />
        </div>
            <span className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-(--color-brand-muted) px-3 py-1 text-xs font-semibold uppercase tracking-wide text-(--color-brand)">
              DMV&apos;s photo-reviewed cleaning service
            </span>
            <h1 className="font-display text-4xl font-bold text-slate-900 md:text-5xl">
              A cleaner home,
              <br />
              confirmed before you pay.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
              Tell us about your space. We review your submission and confirm your price within 1–4 hours.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/booking">Get a Quote</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/#how-it-works">See How It Works</Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
              {['Insured & background checked', 'Quote within 1–4 hours', 'No payment until you approve'].map((item) => (
                <div key={item} className="inline-flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 px-4 text-sm sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} fill="currentColor" />
            ))}
            <span className="ml-1 font-medium text-slate-700">4.9 out of 5</span>
          </div>
          <span className="hidden text-slate-300 sm:block">•</span>
          <span className="text-slate-600">Serving DC, Arlington, Bethesda, McLean & more</span>
          <span className="hidden text-slate-300 sm:block">•</span>
          <p className="italic text-slate-600">&ldquo;Finally a service that doesn&apos;t underquote.&rdquo; — Sarah M., Bethesda</p>
          <p className="italic text-slate-600">&ldquo;The photo review process is genius.&rdquo; — James T., Arlington</p>
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--color-brand)">The process</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">Simple, transparent, from start to finish</h2>
            <p className="mt-3 text-slate-600">We built our process around one rule: no surprises.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.08 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-brand) font-mono text-sm font-bold text-(--color-brand-foreground)">
                          {index + 1}
                        </div>
                        <Icon size={18} className="text-(--color-brand)" />
                      </div>
                      <CardTitle>{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-(--color-brand)">Why we&apos;re different</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">More accurate estimates — before we ever arrive</h2>
            <p className="mt-4 whitespace-pre-line text-slate-600">
              Most cleaning companies give you a quick quote without ever seeing your home. That&apos;s how prices end up
              changing at the door.
              {'\n\n'}
              We do it differently. You share photos, a quick video, or a description. We review your space and give you a
              realistic price range based on what we see — so you know what to expect before booking.
            </p>
            <div className="mt-6 space-y-4">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Clear price range upfront',
                  text: 'We give you a realistic estimate based on your submission — not a blind guess.',
                },
                {
                  icon: Clock,
                  title: 'Final price confirmed after review',
                  text: 'Once we understand the full scope, we lock in your price before the job begins.',
                },
                {
                  icon: Star,
                  title: 'No awkward surprises at the door',
                  text: 'Our goal is full alignment before we arrive — not last-minute changes.',
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="flex gap-3">
                    <Icon size={18} className="mt-0.5 shrink-0 text-(--color-brand)" />
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-900">{item.title}</span> — {item.text}
                    </p>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 text-xs italic text-slate-400">
              Final pricing may adjust if the condition of the space differs significantly from what was shown.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-sm">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="font-medium text-slate-900">📋 You share your space</p>
              </div>
              <div className="ml-6 h-6 border-l-2 border-dashed border-slate-300" />
              <div className="rounded-xl border border-(--color-brand)/20 bg-(--color-brand-muted) p-4">
                <p className="font-medium text-slate-900">🔍 We review &amp; estimate</p>
              </div>
              <div className="ml-6 h-6 border-l-2 border-dashed border-slate-300" />
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="font-medium text-slate-900">✅ You approve the range</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Residential pricing tiers */}
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--color-brand)">Residential cleaning</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">Three tiers. Zero guesswork.</h2>
            <p className="mt-3 text-slate-600">Starting prices shown. Final confirmed after we review your submission.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {services.map((service) => (
              <Card
                key={service.title}
                className={service.popular ? 'border-(--color-brand) border-2 shadow-(--shadow-card-hover)' : ''}
              >
                <CardHeader>
                  {service.popular ? <Badge variant="popular">Most Popular</Badge> : null}
                  <CardTitle className="mt-3">{service.title}</CardTitle>
                  <p
                    className={`font-mono text-4xl font-bold tabular-nums ${service.popular ? 'text-(--color-brand)' : 'text-slate-900'}`}
                  >
                    {service.price}
                  </p>
                  <CardDescription>{service.tagline}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {service.note ? <p className="mt-4 text-xs italic text-slate-600">{service.note}</p> : null}
                </CardContent>
                <CardFooter>
                  <Button asChild variant={service.buttonVariant} className="w-full">
                    <Link href="/booking">Get a Quote</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Additional services */}
          <div className="mx-auto mb-10 mt-20 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--color-brand)">More than just residential</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">We also offer</h2>
            <p className="mt-3 text-slate-600">
              From offices to post-construction — all priced after we review your space.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Home,
                title: 'House Cleaning',
                description: 'Regular and one-time home cleaning for any size residence.',
              },
              {
                icon: Briefcase,
                title: 'Janitorial Services',
                description: 'Ongoing cleaning and maintenance for offices and commercial spaces.',
              },
              {
                icon: Building2,
                title: 'Office & Commercial Cleaning',
                description: 'Professional cleaning for offices, retail spaces, and commercial properties.',
              },
              {
                icon: Truck,
                title: 'Move-In / Move-Out Cleaning',
                description: 'Thorough cleaning for vacant properties, tenant turnover, and new home prep.',
              },
              {
                icon: Wind,
                title: 'Window Cleaning',
                description: 'Interior window cleaning available as a standalone or add-on service.',
              },
              {
                icon: Wrench,
                title: 'Post-Construction Cleanup',
                description: 'Dust, debris, and residue removal after renovation or construction. Quoted after photo review.',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-(--shadow-card)"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--color-brand-muted)">
                    <Icon size={18} className="text-(--color-brand)" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 text-center">
            <Button asChild>
              <Link href="/booking">Get a Quote for Any Service</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-12">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-8 px-4 sm:gap-10 sm:px-6 lg:px-8">
          {[
            { icon: ShieldCheck, label: 'Insured & Background Checked' },
            { icon: Camera, label: 'Photo-Reviewed Pricing' },
            { icon: Calendar, label: 'Flexible Scheduling' },
            { icon: Star, label: 'No Surprises Guarantee' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex flex-col items-center gap-2 text-center">
                <Icon size={20} className="text-(--color-brand-muted)" />
                <span className="text-sm font-medium text-white">{item.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--color-brand)">Customize your clean</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">Add-on services</h2>
            <p className="mt-3 text-slate-600">Available on Standard Cleans. Inside Refrigerator and Inside Oven are included at no charge on Deep Clean and Move-In/Move-Out.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {addOns.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.name} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-(--shadow-card)">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--color-brand-muted)">
                    <Icon size={16} className="text-(--color-brand)" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">{item.name}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--color-brand)">Where we clean</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">Serving the DMV area</h2>
            <p className="mt-3 text-slate-600">
              Based in Maryland — we travel throughout the region. Not sure if we cover your area? Just ask.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[
              'Washington, DC',
              'Arlington, VA',
              'Alexandria, VA',
              'Bethesda, MD',
              'Silver Spring, MD',
              'McLean, VA',
              'Potomac, MD',
              'Rockville, MD',
              'Gaithersburg, MD',
              'Reston, VA',
              'And surrounding areas',
            ].map((city) => (
              <div
                key={city}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
              >
                <CheckCircle size={13} className="shrink-0 text-emerald-500" />
                {city}
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don&apos;t see your city? <Link href="/booking" className="font-medium text-(--color-brand) underline underline-offset-2">Contact us</Link> — we may still be able to help.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--color-brand)">What clients say</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">Trusted across the DMV</h2>
            <p className="mt-2 text-xs text-slate-400">Reviews from early clients. Individual results may vary.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                quote:
                  "Finally a cleaning service that doesn't underquote. They reviewed my photos, gave me an exact price, and showed up fully prepared. No surprises at all.",
                name: 'Sarah M.',
                location: 'Bethesda, MD',
              },
              {
                quote:
                  "The photo review process is genius. I've been burned before by services that didn't know what they were walking into. RenewShine knew exactly what my place needed.",
                name: 'James T.',
                location: 'Arlington, VA',
              },
              {
                quote:
                  "I used them for a move-out clean and they were absolutely thorough. The confirmation process gave me peace of mind that the price wouldn't change last minute.",
                name: 'Priya K.',
                location: 'Washington, DC',
              },
            ].map((review) => (
              <Card key={review.name}>
                <CardContent className="pt-6">
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600">&ldquo;{review.quote}&rdquo;</p>
                  <p className="mt-4 text-sm font-semibold text-slate-900">— {review.name}</p>
                  <p className="text-sm text-slate-600">{review.location}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--color-brand)">Common questions</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">Everything you need to know</h2>
          </div>

          <Accordion.Root type="single" collapsible className="divide-y divide-slate-200 border-y border-slate-200">
            {faqs.map((faq, i) => (
              <Accordion.Item key={faq.question} value={`faq-${i}`}>
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full cursor-pointer items-center justify-between py-4 text-left text-sm font-medium text-slate-900 transition-colors duration-200 hover:text-slate-700">
                    {faq.question}
                    <ChevronDown
                      size={16}
                      className="ml-4 shrink-0 text-slate-600 transition-transform duration-200 group-data-[state=open]:rotate-180"
                    />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="pb-4 text-sm leading-relaxed text-slate-600 data-[state=open]:animate-none">
                  {faq.answer}
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </section>

      <section className="bg-(--color-brand) py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white">Ready for a clean you can count on?</h2>
          <p className="mx-auto mt-3 max-w-md text-lg text-white/80">
            Tell us about your space. Get a confirmed price. Pay only when you&apos;re happy.
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
