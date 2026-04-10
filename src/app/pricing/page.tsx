import type { Metadata } from 'next'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  AppWindow,
  Bed,
  Check,
  CheckCircle,
  Flame,
  LayoutGrid,
  Layers,
  Minus,
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

export const metadata: Metadata = {
  title: 'Pricing — RenewShine',
  description: 'Simple, transparent pricing. Your final price confirmed before you pay a single cent.',
}

const tiers = [
  {
    title: 'Standard Clean',
    price: 'From $200',
    tagline: 'Regular maintenance on already-tidy homes',
    items: [
      'Dust all surfaces, furniture & pictures',
      'Scrub & disinfect kitchen sink, bathroom sink, toilet, tub & shower',
      'Wipe countertops, backsplash & appliance exteriors',
      'Vacuum couches, floors & carpets — mop hard floors',
      'Make beds with existing linens',
    ],
    buttonVariant: 'outline' as const,
  },
  {
    title: 'Deep Clean',
    price: 'From $350',
    tagline: 'Full reset. Recommended for first-time clients.',
    items: [
      'Everything in Standard Clean',
      'Ceiling fan blades & light fixtures dusted',
      'Double-scrub disinfection on all sinks, toilets & tubs',
      'Moldings, woodwork & window lock ledges cleaned',
      'Cobwebs removed throughout — inside microwave cleaned',
    ],
    popular: true,
    buttonVariant: 'default' as const,
  },
  {
    title: 'Move-In / Move-Out',
    price: 'From $400',
    tagline: 'Vacant properties and tenant turnover',
    items: [
      'Everything in Deep Clean',
      'Inside all cabinets, cupboards & closets',
      'Full wall wipe-down throughout',
      'Inside refrigerator & oven cleaned',
      'Final walkthrough sweep of all rooms',
    ],
    note: 'Always quoted after photo review — every property is different.',
    buttonVariant: 'outline' as const,
  },
]

const checklistRows = [
  ['Dust all surfaces & furniture', true, true],
  ['Wipe mirrors', true, true],
  ['Remove cobwebs', true, true],
  ['Vacuum couches & upholstery', true, true],
  ['Sweep, vacuum & mop floors', true, true],
  ['Empty trash bins', true, true],
  ['Scrub & disinfect sink', true, true],
  ['Wipe countertops & backsplash', true, true],
  ['Clean stovetop surface', true, true],
  ['Wipe exterior of appliances', true, true],
  ['Spot clean cabinet exteriors', true, true],
  ['Clean interior of microwave', true, true],
  ['Scrub & disinfect toilet', true, true],
  ['Scrub tub & shower', true, true],
  ['Shine glass shower doors', true, true],
  ['Make beds (existing linens)', true, true],
  ['Dust window sills & ledges', true, true],
  ['Dust baseboards', true, true],
  ['Ceiling fan blades dusted', false, true],
  ['Light fixtures dusted', false, true],
  ['Moldings & woodwork dusted', false, true],
  ['Pictures & knick-knacks dusted', false, true],
  ['Double-scrub disinfection', false, true],
  ['Window lock ledges dusted', false, true],
] as const

const addOns = [
  { icon: Refrigerator, name: 'Inside Refrigerator', price: '$65' },
  { icon: Flame, name: 'Inside Oven', price: '$65' },
  { icon: UtensilsCrossed, name: 'Dishes (washed or put away)', price: '$25' },
  { icon: Bed, name: 'Change Linens (clean sheets provided)', price: '$15 per bed' },
  { icon: WashingMachine, name: 'Single Load of Laundry (wash & fold)', price: '$25 per load' },
  { icon: AppWindow, name: 'Interior Windows', price: '$10–$30 per window' },
  { icon: LayoutGrid, name: 'Tidy-Up / Home Organization', price: '$65+' },
  { icon: PaintBucket, name: 'Spot Clean Walls', price: '$35' },
  { icon: Layers, name: 'Basement Cleaning', price: '$75' },
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
              No hidden fees. Your final price confirmed before you pay a single cent.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {tiers.map((tier) => (
            <Card key={tier.title} className={tier.popular ? 'border-(--color-brand) border-2 shadow-(--shadow-card-hover)' : ''}>
              <CardHeader>
                {tier.popular ? <Badge variant="popular">Most Popular</Badge> : null}
                <CardTitle className="mt-3">{tier.title}</CardTitle>
                <p className={`font-mono text-4xl font-bold tabular-nums ${tier.popular ? 'text-(--color-brand)' : 'text-slate-900'}`}>
                  {tier.price}
                </p>
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

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">What&apos;s included</h2>
          <p className="mt-2 text-slate-600">See exactly what&apos;s covered in each service tier.</p>

          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="sticky top-0 border-b border-slate-200 bg-slate-50">
                  <th className="w-1/2 px-4 py-3 text-left font-semibold text-slate-900">Task</th>
                  <th className="w-1/4 px-4 py-3 text-center font-semibold text-slate-900">Standard</th>
                  <th className="w-1/4 px-4 py-3 text-center font-semibold text-(--color-brand)">Deep Clean</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {checklistRows.map(([task, standard, deep], index) => (
                  <tr key={task} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-4 py-3 text-slate-700">{task}</td>
                    <td className="px-4 py-3 text-center">
                      {standard ? <Check size={16} className="mx-auto text-emerald-500" /> : <Minus size={16} className="mx-auto text-slate-300" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {deep ? <Check size={16} className="mx-auto text-emerald-500" /> : <Minus size={16} className="mx-auto text-slate-300" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="add-ons" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Additional services</h2>
          <p className="mt-2 text-slate-600">Available on all service tiers. Select during booking.</p>
          <Badge className="mt-3" variant="neutral">
            Available on all service tiers · Select during booking
          </Badge>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {addOns.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.name} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-(--shadow-card)">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--color-brand-muted)">
                    <Icon size={16} className="text-(--color-brand)" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs font-mono tabular-nums text-slate-600">{item.price}</p>
                  </div>
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

      <section className="bg-slate-50 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Card className="border-emerald-200 bg-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <CheckCircle size={18} className="text-emerald-600" />
                What we do
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  'Gently move light furniture and rugs to clean underneath',
                  'Remove items from surfaces, clean, and return them neatly',
                  'Clean under and behind accessible furniture',
                  'Add thoughtful finishing touches each visit',
                ].map((item) => (
                  <li key={item} className="text-sm text-slate-700">• {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <XCircle size={18} className="text-red-600" />
                What we don&apos;t do
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  'Move items or furniture over 50 lbs',
                  'Clean excessively cluttered or inaccessible areas',
                  'Reach above a 3-step ladder',
                  'Remove items from full shelves or displays',
                  'Handle biohazards of any kind',
                ].map((item) => (
                  <li key={item} className="text-sm text-slate-700">• {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-(--color-brand) py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-2 text-white/80">Your confirmed price is waiting. No surprises.</p>
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
