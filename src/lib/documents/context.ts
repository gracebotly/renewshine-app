import type { Job } from '@/types/database'
import { ADD_ONS } from '@/lib/pricing'
import type { LinkTarget } from './types'

export interface InvoiceLine {
  description: string
  amount: number
}

export interface RenderContext {
  tokens: Record<string, string>
  hasConfirmedDate: boolean
  scheduleValue: string
  addressLine: string
  serviceLabel: string
  bedBathLine: string
  addOnLabels: string[]
  quoteLineItems: { label: string; price: number }[]
  totalDisplay: string
  depositDisplay: string
  balanceDisplay: string
  invoiceLines: InvoiceLine[]
  invoiceSubtotal: number
  invoiceDepositCredit: number
  invoiceAmountDue: number
  invoiceNotes: string
  urls: Record<LinkTarget, string>
}

export interface BuildContextInput {
  job: Job
  depositOverride?: number
  recurringFrequency?: string
  recurringPriceOverride?: number
  depositLink?: string
  paymentLink?: string
  invoiceLines?: InvoiceLine[]
  invoiceNumber?: string
  invoiceDepositCredit?: number
  dueDate?: string
  businessName?: string
  preparedForAddress?: string
  arrivalTime?: string
  invoiceNotes?: string
}

const TIME_PREF_MAP: Record<string, string> = {
  morning: '8am – 12pm',
  afternoon: '12pm – 5pm',
  early_morning: '8am – 10am',
  mid_morning: '10am – 12pm',
  noon: '12pm – 2pm',
  early_afternoon: '2pm – 4pm',
  late_afternoon: '4pm – 6pm',
  flexible: 'Flexible',
}
const SERVICE_LABELS: Record<string, string> = {
  standard: 'Standard Clean',
  deep: 'Deep Clean',
  move_out: 'Move-In/Move-Out',
  post_construction: 'Post-Construction',
}
const FREQ_CONFIG: Record<string, { label: string; mult: number }> = {
  weekly: { label: 'Weekly', mult: 0.8 },
  biweekly: { label: 'Bi-weekly', mult: 0.85 },
  monthly: { label: 'Monthly', mult: 0.9 },
}

function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null
  const dayPart = String(value).split(/[T ]/)[0]
  const d = new Date(`${dayPart}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

function getRoomCallout(serviceType: string | null): string {
  if (serviceType === 'standard' || serviceType === 'deep')
    return ' of the kitchen, bathrooms, bedrooms, and living areas'
  if (serviceType === 'move_out')
    return ' of the property — the kitchen, bathrooms, and any areas needing extra attention'
  return ''
}

export function buildRenderContext(input: BuildContextInput): RenderContext {
  const { job } = input
  const firstName = job.client_name?.split(' ')[0] ?? 'there'
  const serviceLabel =
    SERVICE_LABELS[job.service_type ?? ''] ?? 'Cleaning Service'
  const timePref = job.availability_time_pref
    ? (TIME_PREF_MAP[job.availability_time_pref] ?? 'Flexible')
    : 'Flexible'
  const hasConfirmedDate = Boolean(job.confirmed_date)
  const requestedStart = parseDateOnly(job.availability_start)
  const requestedEnd = parseDateOnly(job.availability_end)
  const startStr = requestedStart
    ? requestedStart.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      })
    : null
  const endStr = requestedEnd
    ? requestedEnd.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null
  const requestedWindow =
    startStr && endStr && startStr !== endStr
      ? `${startStr} – ${endStr}`
      : (startStr ?? 'Dates to be confirmed')
  const requestedLine =
    timePref !== 'Flexible'
      ? `${requestedWindow} · ${timePref}`
      : requestedWindow
  const confirmedArrival = job.confirmed_arrival_pref
    ? (TIME_PREF_MAP[job.confirmed_arrival_pref] ?? '')
    : ''
  const confirmedDateObj = parseDateOnly(
    job.confirmed_date as unknown as string
  )
  const confirmedDateStr = confirmedDateObj
    ? confirmedDateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : ''
  const confirmedLine =
    confirmedArrival && confirmedArrival !== 'Flexible'
      ? `${confirmedDateStr} · ${confirmedArrival}`
      : confirmedDateStr
  const scheduleValue = hasConfirmedDate ? confirmedLine : requestedLine
  const scheduleLabel = hasConfirmedDate ? 'Appointment' : 'Requested window'
  const approvedPrice = job.approved_price ?? 0
  const depositAmount = input.depositOverride ?? job.deposit_amount ?? 100
  const balanceAmount = Math.max(approvedPrice - depositAmount, 0)
  const money = (n: number) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const bedroomCount =
    typeof job.bedrooms === 'number' && job.bedrooms > 0 ? job.bedrooms : null
  const bathroomCount =
    typeof job.bathrooms === 'number' && job.bathrooms > 0
      ? job.bathrooms
      : null
  const bedBathLine = bedroomCount
    ? `${bedroomCount} Bedroom${bedroomCount !== 1 ? 's' : ''} · ${bathroomCount ?? 0} Bathroom${(bathroomCount ?? 0) !== 1 ? 's' : ''}`
    : ''
  const addOnLabels = ADD_ONS.filter(
    (a) => Array.isArray(job.add_ons) && job.add_ons.includes(a.id)
  ).map((a) => a.label)
  const rawLineItems = (job as unknown as { quote_line_items?: unknown })
    .quote_line_items
  const quoteLineItems = Array.isArray(rawLineItems)
    ? rawLineItems.filter(
        (i): i is { label: string; price: number } =>
          !!i &&
          typeof i === 'object' &&
          typeof (i as Record<string, unknown>).label === 'string' &&
          typeof (i as Record<string, unknown>).price === 'number'
      )
    : []
  const activeFreq =
    input.recurringFrequency ??
    (job.service_frequency &&
    ['weekly', 'biweekly', 'monthly'].includes(job.service_frequency)
      ? job.service_frequency
      : null)
  const freqCfg = activeFreq ? FREQ_CONFIG[activeFreq] : null
  const recurringPrice = freqCfg
    ? input.recurringPriceOverride && input.recurringPriceOverride > 0
      ? Math.round(input.recurringPriceOverride)
      : Math.round(approvedPrice * freqCfg.mult)
    : null
  const invoiceLines = input.invoiceLines ?? []
  const invoiceSubtotal = invoiceLines.reduce((sum, l) => sum + l.amount, 0)
  const invoiceDepositCredit =
    input.invoiceDepositCredit ?? (job.deposit_paid ? depositAmount : 0)
  const invoiceAmountDue = Math.max(invoiceSubtotal - invoiceDepositCredit, 0)
  const bookingUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/booking`
  return {
    hasConfirmedDate,
    scheduleValue,
    addressLine: job.address ?? '',
    serviceLabel,
    bedBathLine,
    addOnLabels,
    quoteLineItems,
    totalDisplay: money(approvedPrice),
    depositDisplay: money(depositAmount),
    balanceDisplay: money(balanceAmount),
    invoiceLines,
    invoiceSubtotal,
    invoiceDepositCredit,
    invoiceAmountDue,
    invoiceNotes: input.invoiceNotes ?? '',
    urls: {
      deposit_link: input.depositLink ?? job.stripe_payment_link ?? '#',
      payment_link: input.paymentLink ?? job.stripe_payment_link ?? '#',
      booking_url: bookingUrl,
      custom: '#',
    },
    tokens: {
      firstName,
      service: serviceLabel,
      serviceDetail: [serviceLabel, bedBathLine].filter(Boolean).join(' • '),
      bedBath: bedBathLine ? ` — ${bedBathLine}` : '',
      schedule: scheduleValue,
      scheduleLabel,
      date: confirmedDateStr,
      arrivalWindow: confirmedArrival,
      timePreference: timePref,
      address: job.address ?? 'on file',
      total: money(approvedPrice),
      deposit: money(depositAmount),
      balance: money(balanceAmount),
      roomCallout: getRoomCallout(job.service_type ?? null),
      recurringLine:
        freqCfg && recurringPrice
          ? `Recurring rate:\n${freqCfg.label}: $${recurringPrice.toLocaleString()}/visit`
          : '',
      invoiceNumber: input.invoiceNumber ?? '',
      amountDue: money(invoiceAmountDue),
      dueDate: input.dueDate ?? '',
      businessName: input.businessName ?? '',
      preparedFor: input.preparedForAddress ?? job.address ?? '',
      arrivalTime: input.arrivalTime ?? '',
      notes: input.invoiceNotes ?? '',
      subtotal: money(invoiceSubtotal),
      depositCredit: money(invoiceDepositCredit),
    },
  }
}
