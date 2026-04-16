'use client'

import * as React from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Check, Loader2, Minus, Plus } from 'lucide-react'
import { AvailabilityPicker, type SchedulingMode } from '@/components/booking/AvailabilityPicker'
import { MediaUpload } from '@/components/booking/MediaUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ADD_ONS_FOR_SERVICE, type ServiceType, type TimePreference } from '@/lib/pricing'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
type Frequency = 'one_time' | 'weekly' | 'bi_weekly' | 'monthly'
type FlowType = 'residential' | 'commercial'
type PetOption = 'none' | 'cat' | 'dog' | 'other'
type ConditionOption = 'maintained' | 'some_buildup' | 'heavy_buildup' | 'reset'
type HomeEntryOption = 'home' | 'lockbox' | 'fob' | 'other'

const frequencies: Array<{ id: Frequency; label: string }> = [
  { id: 'one_time', label: 'One-time' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'bi_weekly', label: 'Bi-weekly' },
  { id: 'monthly', label: 'Monthly' },
]

// ─── Phone formatting ─────────────────────────────────────────────────────────
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length < 4) return digits
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function rawPhone(formatted: string): string {
  return formatted.replace(/\D/g, '')
}

// ─── Tile button component ────────────────────────────────────────────────────
// Reusable tile used for home type, pets, condition, home entry, property type
function TileButton({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-xl border px-4 py-3 text-left transition-colors duration-200',
        selected
          ? 'border-(--color-brand) bg-(--color-brand-muted)/40 ring-1 ring-(--color-brand)'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
        className
      )}
    >
      {children}
    </button>
  )
}

export function BookingForm() {
  const router = useRouter()

  // ── Flow + tab switch ──────────────────────────────────────────────────────
  const [flowType, setFlowType] = React.useState<FlowType>('residential')
  const [pendingSwitch, setPendingSwitch] = React.useState<FlowType | null>(null)

  // ── Step counters ──────────────────────────────────────────────────────────
  const [resStep, setResStep] = React.useState(1)
  const [comStep, setComStep] = React.useState(1)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState('')
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // ── Partial save ───────────────────────────────────────────────────────────
  // Stores the DB job ID created when Step 1 completes
  const [partialJobId, setPartialJobId] = React.useState<string | null>(null)
  const [savingPartial, setSavingPartial] = React.useState(false)

  // ── Residential state ──────────────────────────────────────────────────────
  // Step 1 — contact
  const [resName, setResName] = React.useState('')
  const [resEmail, setResEmail] = React.useState('')

  // Step 2 — home details
  const [resHomeType, setResHomeType] = React.useState<'apartment' | 'townhouse' | 'single_family' | 'condo' | ''>('')
  const [bedrooms, setBedrooms] = React.useState(2)
  const [bathrooms, setBathrooms] = React.useState(1)
  const [resPets, setResPets] = React.useState<PetOption | ''>('')
  const [resCondition, setResCondition] = React.useState<ConditionOption | ''>('')

  // Step 3 — service
  const [serviceType, setServiceType] = React.useState<ServiceType>('standard')
  const [selectedAddOns, setSelectedAddOns] = React.useState<string[]>([])
  const [resFrequency, setResFrequency] = React.useState<Frequency>('one_time')

  // Step 4 — location + scheduling + access
  const [resAddress, setResAddress] = React.useState('')
  const [resStartDate, setResStartDate] = React.useState('')
  const [resEndDate, setResEndDate] = React.useState('')
  const [resTimePref, setResTimePref] = React.useState<TimePreference | ''>('')
  const [resSchedulingMode, setResSchedulingMode] = React.useState<SchedulingMode>('specific')
  const [resHomeEntry, setResHomeEntry] = React.useState<HomeEntryOption | ''>('')

  // Step 5 — final
  const [resPhone, setResPhone] = React.useState('')
  const [resNotes, setResNotes] = React.useState('')
  const [resMediaUrls, setResMediaUrls] = React.useState<string[]>([])

  // ── Commercial state ───────────────────────────────────────────────────────
  const [businessName, setBusinessName] = React.useState('')
  const [contactName, setContactName] = React.useState('')
  const [comEmail, setComEmail] = React.useState('')
  const [comPhone, setComPhone] = React.useState('')
  const [propertyType, setPropertyType] = React.useState<'office' | 'retail' | 'warehouse' | 'other'>('office')
  const [squareFootage, setSquareFootage] = React.useState('')
  const [comFrequency, setComFrequency] = React.useState<Frequency>('one_time')
  const [comAddress, setComAddress] = React.useState('')
  const [comStartDate, setComStartDate] = React.useState('')
  const [comEndDate, setComEndDate] = React.useState('')
  const [comTimePref, setComTimePref] = React.useState<TimePreference | ''>('')
  const [comNotes, setComNotes] = React.useState('')
  const [comMediaUrls, setComMediaUrls] = React.useState<string[]>([])

  // ── Derived ────────────────────────────────────────────────────────────────
  const hasResData =
    resStep > 1 || resName !== '' || resEmail !== '' || resMediaUrls.length > 0

  const hasComData =
    comStep > 1 || businessName !== '' || contactName !== '' || comEmail !== '' || comMediaUrls.length > 0

  // ── Helpers ────────────────────────────────────────────────────────────────
  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  const resetResidential = () => {
    setResStep(1)
    setPartialJobId(null)
    setResName('')
    setResEmail('')
    setResHomeType('')
    setBedrooms(2)
    setBathrooms(1)
    setResPets('')
    setResCondition('')
    setServiceType('standard')
    setSelectedAddOns([])
    setResFrequency('one_time')
    setResAddress('')
    setResStartDate('')
    setResEndDate('')
    setResTimePref('')
    setResSchedulingMode('specific')
    setResHomeEntry('')
    setResPhone('')
    setResNotes('')
    setResMediaUrls([])
  }

  const resetCommercial = () => {
    setComStep(1)
    setBusinessName('')
    setContactName('')
    setComEmail('')
    setComPhone('')
    setPropertyType('office')
    setSquareFootage('')
    setComFrequency('one_time')
    setComAddress('')
    setComStartDate('')
    setComEndDate('')
    setComTimePref('')
    setComNotes('')
    setComMediaUrls([])
  }

  const handleTabClick = (target: FlowType) => {
    if (target === flowType) return
    const currentHasData = flowType === 'residential' ? hasResData : hasComData
    if (currentHasData) {
      setPendingSwitch(target)
    } else {
      setFlowType(target)
      setErrors({})
      setSubmitError('')
    }
  }

  const confirmSwitch = () => {
    if (!pendingSwitch) return
    if (flowType === 'residential') resetResidential()
    else resetCommercial()
    setFlowType(pendingSwitch)
    setPendingSwitch(null)
    setErrors({})
    setSubmitError('')
  }

  // ── Partial save — fires when Step 1 is complete and user clicks Next ──────
  const savePartialLead = async (): Promise<boolean> => {
    // If already saved, don't save again
    if (partialJobId) return true
    setSavingPartial(true)
    try {
      const response = await fetch('/api/create-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'residential',
          status: 'partial',
          client_name: resName || 'Unknown',
          client_email: resEmail,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error('Partial save failed')
      setPartialJobId(data.jobId)
      return true
    } catch {
      // Partial save failure is non-blocking — let the user continue
      console.error('Partial save failed — continuing anyway')
      return true
    } finally {
      setSavingPartial(false)
    }
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateResidentialStep = () => {
    const nextErrors: Record<string, string> = {}

    if (resStep === 1) {
      if (!resName.trim()) nextErrors.resName = 'Name is required'
      if (!resEmail.trim()) nextErrors.resEmail = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resEmail)) nextErrors.resEmail = 'Enter a valid email address'
    }

    if (resStep === 2) {
      if (!resHomeType) nextErrors.resHomeType = 'Please select your home type'
      if (!resPets) nextErrors.resPets = 'Please let us know about pets'
      if (!resCondition) nextErrors.resCondition = 'Please select a condition'
    }

    if (resStep === 4) {
      if (!resAddress.trim()) nextErrors.resAddress = 'Address is required'
      if (!resStartDate) nextErrors.resStartDate = 'Date is required'
      if (resSchedulingMode === 'flexible' && !resEndDate) nextErrors.resEndDate = 'Latest date is required'
      if (!resTimePref) nextErrors.resTimePref = 'Time preference is required'
      if (!resHomeEntry) nextErrors.resHomeEntry = 'Please let us know how to get in'
    }

    if (resStep === 5) {
      if (rawPhone(resPhone).length < 10) nextErrors.resPhone = 'Enter a valid 10-digit phone number'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const validateCommercialStep = () => {
    const nextErrors: Record<string, string> = {}
    if (comStep === 1) {
      if (!businessName.trim()) nextErrors.businessName = 'Business name is required'
      if (!contactName.trim()) nextErrors.contactName = 'Contact name is required'
      if (!comEmail.trim()) nextErrors.comEmail = 'Email is required'
      if (rawPhone(comPhone).length < 10) nextErrors.comPhone = 'Enter a valid 10-digit phone number'
    }
    if (comStep === 2 && !comAddress.trim()) nextErrors.comAddress = 'Address is required'
    if (comStep === 3) {
      if (!comStartDate) nextErrors.comStartDate = 'Earliest date is required'
      if (!comEndDate) nextErrors.comEndDate = 'Latest date is required'
      if (!comTimePref) nextErrors.comTimePref = 'Time preference is required'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  // ── Residential Next handler — fires partial save on Step 1 ───────────────
  const handleResNext = async () => {
    if (!validateResidentialStep()) return
    if (resStep === 1) {
      await savePartialLead()
    }
    setResStep((s) => Math.min(5, s + 1))
  }

  // ── Submit residential ─────────────────────────────────────────────────────
  const submitResidential = async () => {
    if (!validateResidentialStep()) return
    setSubmitting(true)
    setSubmitError('')

    try {
      const payload = {
        type: 'residential',
        client_name: resName,
        client_email: resEmail,
        client_phone: rawPhone(resPhone),
        address: resAddress,
        service_type: serviceType,
        service_frequency: resFrequency,
        bedrooms,
        bathrooms,
        add_ons: selectedAddOns,
        condition: resCondition || null,
        pets: resPets || null,
        home_entry: resHomeEntry || null,
        estimated_price_low: 0,
        estimated_price_high: 0,
        availability_start: resStartDate,
        availability_end: resEndDate,
        availability_time_pref: resTimePref,
        media_urls: resMediaUrls,
        notes: resHomeType
          ? `[${resHomeType.replace('_', ' ')}]${resNotes ? ' ' + resNotes : ''}`.trim()
          : resNotes,
      }

      let response: Response

      if (partialJobId) {
        // Update the existing partial record
        response = await fetch(`/api/update-job/${partialJobId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        // No partial save happened — create fresh
        response = await fetch('/api/create-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) throw new Error('Failed')

      const resParams = new URLSearchParams({
        name: resName,
        email: resEmail,
        phone: rawPhone(resPhone),
      })
      router.push(`/booking-submitted?${resParams.toString()}`)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Submit commercial ──────────────────────────────────────────────────────
  const submitCommercial = async () => {
    if (!validateCommercialStep()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const response = await fetch('/api/create-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'commercial',
          client_name: contactName,
          client_email: comEmail,
          client_phone: rawPhone(comPhone),
          business_name: businessName,
          address: comAddress,
          square_footage: squareFootage ? Number(squareFootage) : null,
          condition: null,
          service_frequency: comFrequency,
          availability_start: comStartDate,
          availability_end: comEndDate,
          availability_time_pref: comTimePref,
          media_urls: comMediaUrls,
          notes: comNotes,
          service_type: null,
          bedrooms: null,
          bathrooms: null,
          add_ons: [],
          estimated_price_low: 0,
          estimated_price_high: 0,
        }),
      })
      if (!response.ok) throw new Error('Failed')
      const comParams = new URLSearchParams({
        name: contactName,
        email: comEmail,
        phone: rawPhone(comPhone),
      })
      router.push(`/booking-submitted?${comParams.toString()}`)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Booking summary values (Step 5) ───────────────────────────────────────
  const serviceLabel =
    serviceType === 'standard' ? 'Standard Clean'
    : serviceType === 'deep' ? 'Detailed Clean'
    : 'Move-In / Move-Out'

  const frequencyLabel =
    resFrequency === 'one_time' ? 'One-time'
    : resFrequency === 'weekly' ? 'Weekly'
    : resFrequency === 'bi_weekly' ? 'Bi-weekly'
    : 'Monthly'

  const timeLabel =
    resTimePref === 'early_morning' ? '8am – 10am'
    : resTimePref === 'mid_morning' ? '10am – 12pm'
    : resTimePref === 'noon' ? '12pm – 2pm'
    : resTimePref === 'early_afternoon' ? '2pm – 4pm'
    : resTimePref === 'late_afternoon' ? '4pm – 6pm'
    : resTimePref === 'flexible' ? 'Flexible'
    : '—'

  const dateLabel =
    resStartDate
      ? resSchedulingMode === 'specific'
        ? new Date(resStartDate + 'T12:00:00').toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
          })
        : resEndDate
          ? `${new Date(resStartDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(resEndDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
          : '—'
      : '—'

  const conditionLabel =
    resCondition === 'maintained' ? 'Well maintained'
    : resCondition === 'some_buildup' ? 'Some buildup'
    : resCondition === 'heavy_buildup' ? 'Heavy buildup'
    : resCondition === 'reset' ? 'Full reset needed'
    : '—'

  const petsLabel =
    resPets === 'none' ? 'No pets'
    : resPets === 'cat' ? 'Cat'
    : resPets === 'dog' ? 'Dog'
    : resPets === 'other' ? 'Other pets'
    : '—'

  const addOnLabels = selectedAddOns.length
    ? ADD_ONS_FOR_SERVICE(serviceType)
        .filter((a) => selectedAddOns.includes(a.id))
        .map((a) => a.label)
        .join(', ')
    : 'None'

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 rounded-xl border border-slate-200 p-5 sm:p-6">

      {/* Tab toggle */}
      <div className="flex gap-2">
        {(['residential', 'commercial'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => handleTabClick(type)}
            className={cn(
              'cursor-pointer rounded-lg px-6 py-2.5 text-sm font-medium transition-colors duration-200',
              flowType === type
                ? 'bg-(--color-brand) text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            )}
          >
            {type === 'residential' ? 'Residential' : 'Commercial'}
          </button>
        ))}
      </div>

      {/* Switch confirmation banner */}
      {pendingSwitch ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              Switch to {pendingSwitch === 'residential' ? 'Residential' : 'Commercial'}?
            </p>
            <p className="mt-0.5 text-xs text-slate-600">Your current entries will be cleared.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setPendingSwitch(null)}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
            >
              Keep {flowType === 'residential' ? 'Residential' : 'Commercial'}
            </button>
            <button
              type="button"
              onClick={confirmSwitch}
              className="cursor-pointer rounded-lg bg-(--color-brand) px-3 py-1.5 text-xs font-medium text-white transition-colors duration-200 hover:bg-(--color-brand-hover)"
            >
              Yes, switch
            </button>
          </div>
        </div>
      ) : null}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* RESIDENTIAL FLOW — 5 steps                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {flowType === 'residential' ? (
        <div className="space-y-6">

          {/* Progress bar */}
          <div>
            <p className="text-sm font-medium text-slate-900">Step {resStep} of 5</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
              <div
                className="h-1.5 rounded-full bg-(--color-brand) transition-all duration-300"
                style={{ width: `${(resStep / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* ── Step 1 — Contact info (lead capture) ── */}
          {resStep === 1 ? (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">Let's get started</h2>
                <p className="mt-1 text-sm text-slate-600">We'll send your confirmed quote to this email.</p>
              </div>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-900">Your Name</span>
                <Input
                  placeholder="Jane Smith"
                  value={resName}
                  onChange={(e) => setResName(e.target.value)}
                  error={Boolean(errors.resName)}
                />
                {errors.resName ? <p className="text-sm text-red-600">{errors.resName}</p> : null}
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-900">Email Address</span>
                <Input
                  type="email"
                  placeholder="jane@email.com"
                  value={resEmail}
                  onChange={(e) => setResEmail(e.target.value)}
                  error={Boolean(errors.resEmail)}
                />
                {errors.resEmail ? <p className="text-sm text-red-600">{errors.resEmail}</p> : null}
                {/* Progress save microcopy */}
                <p className="text-xs text-slate-400">
                  Your quote saves automatically — finish anytime.
                </p>
              </label>
            </div>
          ) : null}

          {/* ── Step 2 — Home details ── */}
          {resStep === 2 ? (
            <div className="space-y-7">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">Tell us about your home</h2>
                <p className="mt-1 text-sm text-slate-600">This helps us send the right team with the right supplies.</p>
              </div>

              {/* Home type */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-900">What type of home?</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: 'apartment' as const, label: 'Apartment' },
                    { id: 'townhouse' as const, label: 'Townhouse' },
                    { id: 'single_family' as const, label: 'Single Family' },
                    { id: 'condo' as const, label: 'Condo' },
                  ]).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setResHomeType(option.id)}
                      className={cn(
                        'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-150',
                        resHomeType === option.id
                          ? 'border-(--color-brand) bg-(--color-brand) text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {errors.resHomeType ? <p className="text-sm text-red-600">{errors.resHomeType}</p> : null}
              </div>

              {/* Bedrooms + Bathrooms */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-900">Home size</p>
                {[
                  { label: 'Bedrooms', value: bedrooms, min: 1, max: 6, set: setBedrooms },
                  { label: 'Bathrooms', value: bathrooms, min: 0, max: 4, set: setBathrooms },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => item.set((v) => Math.max(item.min, v - 1))}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 transition-colors duration-200 hover:bg-slate-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-mono text-xl font-bold tabular-nums text-slate-900">
                        {item.value}
                      </span>
                      <button
                        type="button"
                        onClick={() => item.set((v) => Math.min(item.max, v + 1))}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 transition-colors duration-200 hover:bg-slate-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pets */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-900">Any pets at home?</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {([
                    { id: 'none' as PetOption, label: 'No Pets', emoji: '🚫' },
                    { id: 'cat' as PetOption, label: 'Cat', emoji: '🐱' },
                    { id: 'dog' as PetOption, label: 'Dog', emoji: '🐶' },
                    { id: 'other' as PetOption, label: 'Other', emoji: '🐾' },
                  ]).map((option) => (
                    <TileButton
                      key={option.id}
                      selected={resPets === option.id}
                      onClick={() => setResPets(option.id)}
                    >
                      <p className="text-lg">{option.emoji}</p>
                      <p className={cn('mt-1 text-sm font-semibold', resPets === option.id ? 'text-(--color-brand)' : 'text-slate-900')}>
                        {option.label}
                      </p>
                    </TileButton>
                  ))}
                </div>
                {errors.resPets ? <p className="text-sm text-red-600">{errors.resPets}</p> : null}
              </div>

              {/* Condition */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">What's the current condition?</p>
                  <p className="text-xs text-slate-500">Be honest — this helps us send the right team and set accurate expectations.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    {
                      id: 'maintained' as ConditionOption,
                      label: 'Well maintained',
                      sub: 'Cleaned regularly, just needs upkeep',
                      color: 'text-emerald-600',
                      dot: 'bg-emerald-500',
                    },
                    {
                      id: 'some_buildup' as ConditionOption,
                      label: 'Some buildup',
                      sub: "Hasn't been cleaned in a while",
                      color: 'text-amber-600',
                      dot: 'bg-amber-400',
                    },
                    {
                      id: 'heavy_buildup' as ConditionOption,
                      label: 'Heavy buildup',
                      sub: 'Needs serious attention',
                      color: 'text-orange-600',
                      dot: 'bg-orange-500',
                    },
                    {
                      id: 'reset' as ConditionOption,
                      label: 'Full reset',
                      sub: 'Never been professionally cleaned',
                      color: 'text-red-600',
                      dot: 'bg-red-500',
                    },
                  ]).map((option) => (
                    <TileButton
                      key={option.id}
                      selected={resCondition === option.id}
                      onClick={() => setResCondition(option.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn('h-2 w-2 rounded-full shrink-0', option.dot)} />
                        <p className={cn('text-sm font-semibold', resCondition === option.id ? 'text-(--color-brand)' : 'text-slate-900')}>
                          {option.label}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 pl-4">{option.sub}</p>
                    </TileButton>
                  ))}
                </div>
                {errors.resCondition ? <p className="text-sm text-red-600">{errors.resCondition}</p> : null}
              </div>

            </div>
          ) : null}

          {/* ── Step 3 — Service details ── */}
          {resStep === 3 ? (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">How would you like your home to feel?</h2>
                <p className="mt-1 text-sm text-slate-600">Choose a service — your quote is confirmed after we review your photos.</p>
              </div>

              {/* Service type — starting prices only, no estimate calculation */}
              <div className="space-y-3">
                {([
                  {
                    id: 'standard' as ServiceType,
                    title: 'Standard Clean',
                    price: 'from $200',
                    desc: 'Maintenance cleaning for regularly kept homes',
                  },
                  {
                    id: 'deep' as ServiceType,
                    title: 'Detailed Clean',
                    price: 'from $350',
                    desc: 'Full top-to-bottom clean, every surface, every corner',
                  },
                  {
                    id: 'move_out' as ServiceType,
                    title: 'Move-In / Move-Out',
                    price: 'from $500',
                    desc: 'For vacant properties and tenant turnover',
                  },
                ]).map(({ id, title, price, desc }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setServiceType(id)}
                    className={cn(
                      'w-full cursor-pointer rounded-xl border p-4 text-left transition-colors duration-200',
                      serviceType === id
                        ? 'border-2 border-(--color-brand) bg-(--color-brand-muted)/30'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
                      </div>
                      <p className="shrink-0 font-mono text-sm font-semibold tabular-nums text-slate-900">{price}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Add-ons */}
              <div className="space-y-2 rounded-xl border border-slate-200 p-4">
                <p className="font-medium text-slate-900">Add-ons <span className="text-xs font-normal text-slate-400">(optional)</span></p>
                {ADD_ONS_FOR_SERVICE(serviceType).map((addOn) => (
                  <label key={addOn.id} className="flex cursor-pointer items-center gap-3 py-1">
                    <span className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <Checkbox.Root
                        checked={selectedAddOns.includes(addOn.id)}
                        onCheckedChange={() => toggleAddOn(addOn.id)}
                        className="flex h-4 w-4 items-center justify-center rounded border border-slate-300"
                      >
                        <Checkbox.Indicator>
                          <Check size={12} className="text-(--color-brand)" />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      {addOn.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Frequency */}
              <div>
                <p className="mb-2 font-medium text-slate-900">How often?</p>
                <div className="grid gap-2 sm:grid-cols-4">
                  {frequencies.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setResFrequency(f.id)}
                      className={cn(
                        'cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-200',
                        resFrequency === f.id
                          ? 'border-(--color-brand) bg-(--color-brand) text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress microcopy */}
              <p className="text-center text-xs text-slate-400">
                Almost halfway — just 2 more quick steps.
              </p>
            </div>
          ) : null}

          {/* ── Step 4 — Location + scheduling + home entry ── */}
          {resStep === 4 ? (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">Where and when?</h2>
                <p className="mt-1 text-sm text-slate-600">We'll confirm your exact appointment within 1–4 hours.</p>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-900" htmlFor="res-address">
                  Service Address
                </label>
                <Input
                  id="res-address"
                  value={resAddress}
                  onChange={(e) => setResAddress(e.target.value)}
                  placeholder="Street address, City, State, ZIP"
                  autoComplete="street-address"
                  error={Boolean(errors.resAddress)}
                />
                <p className="text-xs text-slate-500">e.g. 4521 Oak Hill Dr, Bowie, MD 20715</p>
                {errors.resAddress ? <p className="text-sm text-red-600">{errors.resAddress}</p> : null}
              </div>

              {/* Scheduling */}
              <AvailabilityPicker
                schedulingMode={resSchedulingMode}
                onSchedulingModeChange={setResSchedulingMode}
                startDate={resStartDate}
                endDate={resEndDate}
                timePreference={resTimePref}
                onStartDateChange={setResStartDate}
                onEndDateChange={setResEndDate}
                onTimePreferenceChange={setResTimePref}
              />
              {errors.resStartDate || errors.resEndDate || errors.resTimePref ? (
                <p className="text-sm text-red-600">Please complete all scheduling fields.</p>
              ) : null}

              {/* Home entry */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-900">How will our team get in?</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: 'home' as HomeEntryOption, label: "I'll be home", sub: "You'll let us in" },
                    { id: 'lockbox' as HomeEntryOption, label: 'Lockbox / key', sub: 'Code shared in notes' },
                    { id: 'fob' as HomeEntryOption, label: 'Building fob', sub: 'Access arranged by you' },
                    { id: 'other' as HomeEntryOption, label: 'Other', sub: 'Explain in notes' },
                  ]).map((option) => (
                    <TileButton
                      key={option.id}
                      selected={resHomeEntry === option.id}
                      onClick={() => setResHomeEntry(option.id)}
                    >
                      <p className={cn('text-sm font-semibold', resHomeEntry === option.id ? 'text-(--color-brand)' : 'text-slate-900')}>
                        {option.label}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">{option.sub}</p>
                    </TileButton>
                  ))}
                </div>
                {errors.resHomeEntry ? <p className="text-sm text-red-600">{errors.resHomeEntry}</p> : null}
              </div>
            </div>
          ) : null}

          {/* ── Step 5 — Final details + submit ── */}
          {resStep === 5 ? (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">Almost done</h2>
                <p className="mt-1 text-sm text-slate-600">One last thing, then we'll take it from here.</p>
              </div>

              {/* Phone */}
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-900">Phone Number</span>
                <Input
                  type="tel"
                  placeholder="(301) 555-1234"
                  value={resPhone}
                  onChange={(e) => setResPhone(formatPhone(e.target.value))}
                  error={Boolean(errors.resPhone)}
                />
                <p className="text-xs text-slate-400">We'll text you when your quote is confirmed.</p>
                {errors.resPhone ? <p className="text-sm text-red-600">{errors.resPhone}</p> : null}
              </label>

              {/* Notes */}
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-900">Anything else we should know?</span>
                <textarea
                  className="flex min-h-[90px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 hover:border-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:ring-offset-0"
                  placeholder="Access code, gate instructions, areas to focus on, fragrance sensitivities..."
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                />
              </label>

              {/* Media upload */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-slate-900">Show us your space</p>
                <p className="text-xs text-slate-500">
                  The more we can see, the more accurate your quote. A 60-second walkthrough video works best.
                </p>
                <MediaUpload onUpload={setResMediaUrls} uploadedUrls={resMediaUrls} />
              </div>

              {/* Booking summary */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Your Request Summary</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Service</p>
                    <p className="font-medium text-slate-900">{serviceLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Frequency</p>
                    <p className="font-medium text-slate-900">{frequencyLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Home size</p>
                    <p className="font-medium text-slate-900">
                      {bedrooms} bed · {bathrooms === 0 ? 'Studio' : `${bathrooms} bath`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Condition</p>
                    <p className="font-medium text-slate-900">{conditionLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Pets</p>
                    <p className="font-medium text-slate-900">{petsLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">
                      {resSchedulingMode === 'specific' ? 'Preferred date' : 'Date window'}
                    </p>
                    <p className="font-medium text-slate-900">{dateLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Arrival window</p>
                    <p className="font-medium text-slate-900">{timeLabel}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="font-medium text-slate-900">{resAddress || '—'}</p>
                  </div>
                  {selectedAddOns.length > 0 ? (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500">Add-ons</p>
                      <p className="font-medium text-slate-900">{addOnLabels}</p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Commitment copy + submit */}
              <div className="space-y-3">
                <p className="text-center text-sm text-slate-600">
                  We'll review your photos and confirm your exact price within 1–4 hours —{' '}
                  <span className="font-medium text-slate-900">no payment until you approve.</span>
                </p>
                <Button
                  type="button"
                  size="lg"
                  className="w-full"
                  disabled={submitting || savingPartial}
                  onClick={submitResidential}
                >
                  {submitting
                    ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                    : 'Request My Custom Quote'}
                </Button>
              </div>
            </div>
          ) : null}

          {/* Back / Next */}
          <div className="flex justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResStep((s) => Math.max(1, s - 1))}
              disabled={resStep === 1 || submitting || savingPartial}
            >
              Back
            </Button>
            {resStep < 5 ? (
              <Button
                type="button"
                onClick={handleResNext}
                disabled={submitting || savingPartial}
              >
                {savingPartial ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Next'}
              </Button>
            ) : null}
          </div>
        </div>

      ) : (

      /* ═══════════════════════════════════════════════════════════════════ */
      /* COMMERCIAL FLOW — 3 steps (unchanged)                              */
      /* ═══════════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-slate-900">Step {comStep} of 3</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
              <div className="h-1.5 rounded-full bg-(--color-brand)" style={{ width: `${(comStep / 3) * 100}%` }} />
            </div>
          </div>

          {comStep === 1 ? (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-slate-900">Tell us about your business</h2>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-900">Business Name</span>
                <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} error={Boolean(errors.businessName)} />
                {errors.businessName ? <p className="text-sm text-red-600">{errors.businessName}</p> : null}
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-900">Your Name</span>
                <Input value={contactName} onChange={(e) => setContactName(e.target.value)} error={Boolean(errors.contactName)} />
                {errors.contactName ? <p className="text-sm text-red-600">{errors.contactName}</p> : null}
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-900">Email</span>
                <Input type="email" value={comEmail} onChange={(e) => setComEmail(e.target.value)} error={Boolean(errors.comEmail)} />
                {errors.comEmail ? <p className="text-sm text-red-600">{errors.comEmail}</p> : null}
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-900">Phone Number</span>
                <Input
                  type="tel"
                  placeholder="(301) 555-1234"
                  value={comPhone}
                  onChange={(e) => setComPhone(formatPhone(e.target.value))}
                  error={Boolean(errors.comPhone)}
                />
                {errors.comPhone ? <p className="text-sm text-red-600">{errors.comPhone}</p> : null}
              </label>
            </div>
          ) : null}

          {comStep === 2 ? (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-slate-900">About your space</h2>
              <div>
                <p className="mb-2 font-medium text-slate-900">Property Type</p>
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                  {(['office', 'retail', 'warehouse', 'other'] as const).map((id) => (
                    <TileButton key={id} selected={propertyType === id} onClick={() => setPropertyType(id)}>
                      <p className={cn('text-sm font-semibold capitalize', propertyType === id ? 'text-(--color-brand)' : 'text-slate-900')}>
                        {id}
                      </p>
                    </TileButton>
                  ))}
                </div>
              </div>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-900">Approximate Square Footage</span>
                <Input type="number" placeholder="e.g. 2000" value={squareFootage} onChange={(e) => setSquareFootage(e.target.value)} />
                <p className="text-xs text-slate-500">Estimate is fine — we confirm during walkthrough</p>
              </label>
              <div>
                <p className="mb-2 font-medium text-slate-900">Cleaning Frequency</p>
                <div className="grid gap-2 sm:grid-cols-4">
                  {frequencies.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setComFrequency(f.id)}
                      className={cn(
                        'cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-200',
                        comFrequency === f.id
                          ? 'border-(--color-brand) bg-(--color-brand) text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-900">Property Address</span>
                <Input
                  value={comAddress}
                  onChange={(e) => setComAddress(e.target.value)}
                  placeholder="Street address, City, State, ZIP"
                  error={Boolean(errors.comAddress)}
                />
                {errors.comAddress ? <p className="text-sm text-red-600">{errors.comAddress}</p> : null}
              </label>
            </div>
          ) : null}

          {comStep === 3 ? (
            <div className="space-y-5">
              <AvailabilityPicker
                schedulingMode="flexible"
                onSchedulingModeChange={() => {}}
                startDate={comStartDate}
                endDate={comEndDate}
                timePreference={comTimePref}
                onStartDateChange={setComStartDate}
                onEndDateChange={setComEndDate}
                onTimePreferenceChange={setComTimePref}
              />
              {errors.comStartDate || errors.comEndDate || errors.comTimePref ? (
                <p className="text-sm text-red-600">Please complete all scheduling fields.</p>
              ) : null}
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-900">Notes</span>
                <textarea
                  className="flex min-h-[100px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 hover:border-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:ring-offset-0"
                  placeholder="Access instructions, security codes, areas of focus, any special requirements..."
                  value={comNotes}
                  onChange={(e) => setComNotes(e.target.value)}
                />
              </label>
              <MediaUpload onUpload={setComMediaUrls} uploadedUrls={comMediaUrls} />
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Submission Summary</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div><p className="text-xs text-slate-500">Business</p><p className="font-medium text-slate-900">{businessName || '—'}</p></div>
                  <div><p className="text-xs text-slate-500">Property type</p><p className="font-medium text-slate-900 capitalize">{propertyType}</p></div>
                  <div><p className="text-xs text-slate-500">Square footage</p><p className="font-medium text-slate-900">{squareFootage ? `~${Number(squareFootage).toLocaleString()} sq ft` : 'Not provided'}</p></div>
                  <div>
                    <p className="text-xs text-slate-500">Frequency</p>
                    <p className="font-medium text-slate-900">
                      {comFrequency === 'one_time' ? 'One-time' : comFrequency === 'weekly' ? 'Weekly' : comFrequency === 'bi_weekly' ? 'Bi-weekly' : 'Monthly'}
                    </p>
                  </div>
                  <div className="col-span-2"><p className="text-xs text-slate-500">Address</p><p className="font-medium text-slate-900">{comAddress || '—'}</p></div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-center text-sm text-slate-600">
                  We'll review and confirm your quote within 1–4 hours —{' '}
                  <span className="font-medium text-slate-900">no payment until you approve.</span>
                </p>
                <Button type="button" size="lg" className="w-full" disabled={submitting} onClick={submitCommercial}>
                  {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : 'Request My Custom Quote'}
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setComStep((s) => Math.max(1, s - 1))}
              disabled={comStep === 1 || submitting}
            >
              Back
            </Button>
            {comStep < 3 ? (
              <Button
                type="button"
                onClick={() => { if (validateCommercialStep()) setComStep((s) => Math.min(3, s + 1)) }}
                disabled={submitting}
              >
                Next
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
    </div>
  )
}
