'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import {
  AppWindow,
  Bed,
  CheckCircle,
  Flame,
  LayoutGrid,
  Layers,
  PaintBucket,
  Refrigerator,
  ShieldAlert,
  UtensilsCrossed,
  WashingMachine,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'


const tiers = [
  {
    title: 'Standard Clean',
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

  {
    title: 'Post-Construction Cleaning',
    tagline: 'After renovation, new builds, and construction projects',
    items: [
      'Fine dust and debris removal — all surfaces',
      'Window sills, ledges, and trim detail cleaned',
      'Floor vacuuming and mopping (multiple passes)',
      'Surface wipe-downs — walls, counters, fixtures',
      'Bathroom and kitchen sanitation',
      'Residue and adhesive cleanup',
    ],
    note: 'Always quoted after photo/video review — every project is different.',
    buttonVariant: 'outline' as const,
  },
]

const addOns = [
  { icon: Refrigerator, name: 'Inside Refrigerator' },
  { icon: Flame, name: 'Inside Oven' },
  { icon: UtensilsCrossed, name: 'Dishes (washed or put away)' },
  { icon: Bed, name: 'Change Linens (clean sheets provided)' },
  { icon: WashingMachine, name: 'Single Load of Laundry (wash & fold)' },
  { icon: AppWindow, name: 'Interior Windows' },
  { icon: LayoutGrid, name: 'Tidy-Up / Home Organization' },
  { icon: PaintBucket, name: 'Spot Clean Walls' },
  { icon: Layers, name: 'Basement Cleaning' },
]

const notOffered = [
  'Extreme clutter or hoarding situations',
  'Mold, biohazards or hazardous materials of any kind',
  'Animal litter cleaning',
  'Lifting or moving items over 50 lbs',
  'Heavy scrubbing of walls (full wall paint scrubbing)',
  'High-reach areas above a 3-step ladder',
  'Exterior windows',
  'Chandeliers or hanging light fixtures',
  'Exterior of property (driveways, patios, outdoor furniture)',
  'Light bulb replacement',
]

export default function PricingPage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-(--color-brand)">Pricing</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-slate-900">Simple, Transparent Pricing</h1>
            <p className="mt-3 text-lg text-slate-600">
              No guessing. Your confirmed price is set after we review your photos — before you pay anything.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 sm:grid-cols-2 lg:px-8">
          {tiers.map((tier) => (
            <Card key={tier.title} className={tier.popular ? 'border-(--color-brand) border-2 shadow-(--shadow-card-hover)' : ''}>
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
      </section>

      <section id="add-ons" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Additional services</h2>
          <p className="mt-2 text-sm text-slate-600">
            Available on Standard Cleans · Priced after review · Select during booking
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <ShieldAlert size={24} className="mx-auto text-amber-500" />
            <h2 className="mt-3 text-2xl font-bold text-slate-900">Services we don&apos;t offer</h2>
            <p className="mt-2 text-slate-600">
              For the safety of our team and the quality of our service, we do not offer the following.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {notOffered.map((item) => (
              <div key={item} className="flex items-start gap-2 rounded-lg border border-slate-200 p-3">
                <XCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                <span className="text-sm text-slate-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-(--color-brand) py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-2 text-white/80">Your confirmed quote is one submission away. No surprises.</p>
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
