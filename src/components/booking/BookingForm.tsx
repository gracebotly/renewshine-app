'use client'

import * as React from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Check, Loader2, Minus, Plus } from 'lucide-react'
import { AvailabilityPicker, type SchedulingMode } from '@/components/booking/AvailabilityPicker'
import { MediaUpload } from '@/components/booking/MediaUpload'
import { PriceEstimate } from '@/components/booking/PriceEstimate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ADD_ONS_FOR_SERVICE, estimatePrice, type ServiceType, type TimePreference } from '@/lib/pricing'
import { cn } from '@/lib/utils'

type Frequency = 'one_time' | 'weekly' | 'bi_weekly' | 'monthly'
type FlowType = 'residential' | 'commercial'

const frequencies: Array<{ id: Frequency; label: string }> = [
  { id: 'one_time', label: 'One-time' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'bi_weekly', label: 'Bi-weekly' },
  { id: 'monthly', label: 'Monthly' },
]

// ─── Phone formatting ────────────────────────────────────────────────────────
// Formats 10 raw digits → (301) 555-1234 as the user types.
// Strips all non-digits first, caps at 10 digits.
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length < 4) return digits
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

// Returns the raw digits from a formatted phone string (for submit payload)
function rawPhone(formatted: string): string {
  return formatted.replace(/\D/g, '')
}

export function BookingForm() {
  const router = useRouter()

  // ── Flow type + switch confirmation ────────────────────────────────────────
  const [flowType, setFlowType] = React.useState<FlowType>('residential')
  const [pendingSwitch, setPendingSwitch] = React.useState<FlowType | null>(null)

  const [resStep, setResStep] = React.useState(1)
  const [comStep, setComStep] = React.useState(1)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState('')
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // ── Residential state ──────────────────────────────────────────────────────
  const [bedrooms, setBedrooms] = React.useState(2)
  const [bathrooms, setBathrooms] = React.useState(1)
  const [serviceType, setServiceType] = React.useState<ServiceType>('standard')
  const [selectedAddOns, setSelectedAddOns] = React.useState<string[]>([])
  const [resFrequency, setResFrequency] = React.useState<Frequency>('one_time')
  const [resAddress, setResAddress] = React.useState('')
  const [resStartDate, setResStartDate] = React.useState('')
  const [resEndDate, setResEndDate] = React.useState('')
  const [resTimePref, setResTimePref] = React.useState<TimePreference | ''>('')
  const [resSchedulingMode, setResSchedulingMode] = React.useState<SchedulingMode>('specific')
  const [resNotes, setResNotes] = React.useState('')
  const [resName, setResName] = React.useState('')
  const [resEmail, setResEmail] = React.useState('')
  const [resPhone, setResPhone] = React.useState('')
  const [resMediaUrls, setResMediaUrls] = React.useState<string[]>([])
  const [resHomeType, setResHomeType] = React.useState<'apartment' | 'townhouse' | 'single_family' | 'condo' | ''>('')

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

  const estimate = serviceType === 'move_out' ? null : estimatePrice(bedrooms, bathrooms, serviceType, selectedAddOns)

  // Derived booleans — must live after all useState declarations
  const hasResData =
    resStep > 1 ||
    resHomeType !== '' ||
    resAddress !== '' ||
    resName !== '' ||
    resEmail !== '' ||
    resPhone !== '' ||
    resMediaUrls.length > 0

  const hasComData =
    comStep > 1 ||
    businessName !== '' ||
    contactName !== '' ||
    comEmail !== '' ||
    comPhone !== '' ||
    comMediaUrls.length > 0

  // ── Helpers ────────────────────────────────────────────────────────────────
  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  // Reset residential state when switching away from it
  const resetResidential = () => {
    setResStep(1)
    setBedrooms(2)
    setBathrooms(1)
    setServiceType('standard')
    setSelectedAddOns([])
    setResFrequency('one_time')
    setResAddress('')
    setResStartDate('')
    setResEndDate('')
    setResTimePref('')
    setResSchedulingMode('specific')
    setResNotes('')
    setResName('')
    setResEmail('')
    setResPhone('')
    setResMediaUrls([])
    setResHomeType('')
  }

  // Reset commercial state when switching away from it
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

  // Called when a tab button is clicked
  const handleTabClick = (target: FlowType) => {
    if (target === flowType) return
    const currentHasData = flowType === 'residential' ? hasResData : hasComData
    if (currentHasData) {
      // Show inline confirmation instead of switching immediately
      setPendingSwitch(target)
    } else {
      setFlowType(target)
      setErrors({})
      setSubmitError('')
    }
  }

  // Called when user confirms the switch in the banner
  const confirmSwitch = () => {
    if (!pendingSwitch) return
    if (flowType === 'residential') resetResidential()
    else resetCommercial()
    setFlowType(pendingSwitch)
    setPendingSwitch(null)
    setErrors({})
    setSubmitError('')
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateResidentialStep = () => {
    const nextErrors: Record<string, string> = {}
    if (resStep === 1 && !resHomeType) nextErrors.resHomeType = 'Please select your home type'
    if (resStep === 3 && !resAddress.trim()) nextErrors.resAddress = 'Address is required'
    if (resStep === 4) {
      if (!resStartDate) nextErrors.resStartDate = 'Date is required'
      if (resSchedulingMode === 'flexible' && !resEndDate) nextErrors.resEndDate = 'Latest date is required'
      if (!resTimePref) nextErrors.resTimePref = 'Time preference is required'
    }
    if (resStep === 5) {
      if (!resName.trim()) nextErrors.resName = 'Name is required'
      if (!resEmail.trim()) nextErrors.resEmail = 'Email is required'
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

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submitResidential = async () => {
    if (!validateResidentialStep()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const response = await fetch('/api/create-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
          estimated_price_low: estimate?.low ?? 0,
          estimated_price_high: estimate?.high ?? 0,
          availability_start: resStartDate,
          availability_end: resEndDate,
          availability_time_pref: resTimePref,
          media_urls: resMediaUrls,
          notes: resHomeType ? `[${resHomeType.replace('_', ' ')}] ${resNotes}`.trim() : resNotes,
        }),
      })
      if (!response.ok) throw new Error('Failed')
      router.push('/booking-submitted')
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

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
          condition: null, // removed from form — assessed from photos
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
      router.push('/booking-submitted')
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 rounded-xl border border-slate-200 p-5 sm:p-6">

      {/* ── Tab toggle ── */}
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

      {/* ── Switch confirmation banner ── */}
      {pendingSwitch ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              Switch to {pendingSwitch === 'residential' ? 'Residential' : 'Commercial'}?
            </p>
            <p className="mt-0.5 text-xs text-slate-600">
              Your current form entries will be cleared.
            </p>
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

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* RESIDENTIAL FLOW                                                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {flowType === 'residential' ? (
        <div className="space-y-6">

          {/* Progress bar */}
          <div>
            <p className="text-sm font-medium text-slate-900">Step {resStep} of 5</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
              <div className="h-1.5 rounded-full bg-(--color-brand)" style={{ width: `${(resStep / 5) * 100}%` }} />
            </div>
          </div>

          {/* Step 1 — Home details */}
          {resStep === 1 ? (
            <div className="space-y-7">
              <h2 className="font-display text-xl font-bold text-slate-900">Tell us about your home</h2>

              {/* ── Home type chips ── */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-900">What type of home?</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    {
                      id: 'apartment' as const,
                      label: 'Apartment',
                      icon: (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="2" width="12" height="11" rx="1"/>
                          <line x1="1" y1="6.5" x2="13" y2="6.5"/>
                          <line x1="7" y1="2" x2="7" y2="13"/>
                          <rect x="2.5" y="8" width="2" height="2" rx="0.3" fill="currentColor" opacity="0.4"/>
                          <rect x="9.5" y="8" width="2" height="2" rx="0.3" fill="currentColor" opacity="0.4"/>
                          <rect x="5.5" y="9.5" width="3" height="3.5" rx="0.3"/>
                        </svg>
                      ),
                    },
                    {
                      id: 'townhouse' as const,
                      label: 'Townhouse',
                      icon: (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 7.5L4 4.5L7 7.5V13H1V7.5Z"/>
                          <path d="M7 7.5L10 4.5L13 7.5V13H7V7.5Z"/>
                          <rect x="2.5" y="9" width="2" height="4" rx="0.3"/>
                          <rect x="9.5" y="9" width="2" height="4" rx="0.3"/>
                        </svg>
                      ),
                    },
                    {
                      id: 'single_family' as const,
                      label: 'Single Family',
                      icon: (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1.5 7L7 2.5L12.5 7"/>
                          <path d="M2.5 6.2V13H11.5V6.2"/>
                          <rect x="5.5" y="9" width="3" height="4" rx="0.3"/>
                          <rect x="3" y="7.5" width="2.5" height="2.5" rx="0.3" fill="currentColor" opacity="0.35"/>
                          <rect x="8.5" y="7.5" width="2.5" height="2.5" rx="0.3" fill="currentColor" opacity="0.35"/>
                        </svg>
                      ),
                    },
                    {
                      id: 'condo' as const,
                      label: 'Condo',
                      icon: (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="1.5" width="8" height="11.5" rx="1"/>
                          <line x1="3" y1="5" x2="11" y2="5" strokeOpacity="0.4"/>
                          <line x1="3" y1="8" x2="11" y2="8" strokeOpacity="0.4"/>
                          <rect x="4.5" y="2.5" width="2" height="2" rx="0.3" fill="currentColor" opacity="0.35"/>
                          <rect x="7.5" y="2.5" width="2" height="2" rx="0.3" fill="currentColor" opacity="0.35"/>
                          <rect x="4.5" y="5.5" width="2" height="2" rx="0.3" fill="currentColor" opacity="0.35"/>
                          <rect x="7.5" y="5.5" width="2" height="2" rx="0.3" fill="currentColor" opacity="0.35"/>
                          <rect x="5.5" y="9.5" width="3" height="3.5" rx="0.3"/>
                        </svg>
                      ),
                    },
                  ]).map((option) => {
                    const isSelected = resHomeType === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setResHomeType(option.id)}
                        className={cn(
                          'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-150',
                          isSelected
                            ? 'border-(--color-brand) bg-(--color-brand) text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        )}
                      >
                        <span className={isSelected ? 'text-white' : 'text-slate-400'}>
                          {option.icon}
                        </span>
                        {option.label}
                      </button>
                    )
                  })}
                </div>
                {errors.resHomeType ? (
                  <p className="text-sm text-red-600">{errors.resHomeType}</p>
                ) : null}
              </div>

              {/* ── Bedrooms + Bathrooms steppers ── */}
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

              {/* ── Parking notes (optional) ── */}
              <div>
                <label className="block space-y-1.5">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Parking instructions</p>
                    <p className="text-xs text-slate-500">Optional — let us know if there&apos;s anything to be aware of</p>
                  </div>
                  <textarea
                    className="flex min-h-[72px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 hover:border-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:ring-offset-0"
                    placeholder="e.g. Street parking on Oak Ave, visitor spot #4, buzzer code 214..."
                    value={resNotes}
                    onChange={(e) => setResNotes(e.target.value)}
                  />
                </label>
              </div>

            </div>
          ) : null}

          {/* Step 2 — Service + add-ons + frequency */}
          {resStep === 2 ? (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-slate-900">Choose service details</h2>
              <div className="space-y-3">
                {([
                  ['standard', 'Standard Clean', 'from $200'],
                  ['detailed', 'Detailed Clean', 'from $350'],
                  ['move_out', 'Move-In / Move-Out', 'from $500'],
                ] as const).map(([id, title, price]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setServiceType(id as ServiceType)}
                    className={cn(
                      'w-full cursor-pointer rounded-xl border p-4 text-left transition-colors duration-200',
                      serviceType === id
                        ? 'border-2 border-(--color-brand) bg-(--color-brand-muted)/30'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{title}</p>
                      <p className="font-mono text-sm font-semibold tabular-nums text-slate-900">{price}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-2 rounded-xl border border-slate-200 p-4">
                <p className="font-medium text-slate-900">Add-ons (optional)</p>
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

              <div>
                <p className="mb-2 font-medium text-slate-900">Frequency</p>
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
            </div>
          ) : null}

          {/* Step 3 — Address */}
          {resStep === 3 ? (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-slate-900">Where are we cleaning?</h2>
              <div className="space-y-1">
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
                <p className="text-xs text-slate-500">
                  Include full street address — e.g. 4521 Oak Hill Dr, Bowie, MD 20715
                </p>
                {errors.resAddress ? <p className="text-sm text-red-600">{errors.resAddress}</p> : null}
              </div>
            </div>
          ) : null}

          {/* Step 4 — Scheduling */}
          {resStep === 4 ? (
            <div>
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
                <p className="mt-2 text-sm text-red-600">Please complete all scheduling fields.</p>
              ) : null}
            </div>
          ) : null}

          {/* Step 5 — Contact + notes + media + summary + submit */}
          {resStep === 5 ? (
            <div className="space-y-4">
              <label className="space-y-1 block">
                <span className="text-sm font-medium text-slate-900">Full Name</span>
                <Input value={resName} onChange={(e) => setResName(e.target.value)} error={Boolean(errors.resName)} />
                {errors.resName ? <p className="text-sm text-red-600">{errors.resName}</p> : null}
              </label>

              <label className="space-y-1 block">
                <span className="text-sm font-medium text-slate-900">Email Address</span>
                <Input
                  type="email"
                  value={resEmail}
                  onChange={(e) => setResEmail(e.target.value)}
                  error={Boolean(errors.resEmail)}
                />
                {errors.resEmail ? <p className="text-sm text-red-600">{errors.resEmail}</p> : null}
              </label>

              <label className="space-y-1 block">
                <span className="text-sm font-medium text-slate-900">Phone Number</span>
                <Input
                  type="tel"
                  placeholder="(301) 555-1234"
                  value={resPhone}
                  onChange={(e) => setResPhone(formatPhone(e.target.value))}
                  error={Boolean(errors.resPhone)}
                />
                {errors.resPhone ? <p className="text-sm text-red-600">{errors.resPhone}</p> : null}
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-900">Anything else we should know?</span>
                <textarea
                  className="flex min-h-[90px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 hover:border-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:ring-offset-0"
                  placeholder="Access code, pets, parking notes, areas to focus on..."
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                />
              </label>

              <MediaUpload onUpload={setResMediaUrls} uploadedUrls={resMediaUrls} />

              {/* Booking summary */}
              {(() => {
                const serviceLabel =
                  serviceType === 'standard' ? 'Standard Clean'
                  : serviceType === 'detailed' ? 'Detailed Clean'
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

                const bathroomLabel = bathrooms === 0 ? 'Studio / no full bath' : `${bathrooms} bath`

                const addOnLabels = selectedAddOns.length
                  ? ADD_ONS_FOR_SERVICE(serviceType)
                      .filter((a) => selectedAddOns.includes(a.id))
                      .map((a) => a.label)
                      .join(', ')
                  : 'None'

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

                return (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Booking Summary</p>
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
                        <p className="font-medium text-slate-900">{bedrooms} bed · {bathroomLabel}</p>
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
                )
              })()}

              <Button type="button" size="lg" className="w-full" disabled={submitting} onClick={submitResidential}>
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : 'Submit for Review'}
              </Button>
            </div>
          ) : null}

          {/* Back / Next */}
          <div className="flex justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResStep((s) => Math.max(1, s - 1))}
              disabled={resStep === 1 || submitting}
            >
              Back
            </Button>
            {resStep < 5 ? (
              <Button
                type="button"
                onClick={() => { if (validateResidentialStep()) setResStep((s) => Math.min(5, s + 1)) }}
                disabled={submitting}
              >
                Next
              </Button>
            ) : null}
          </div>
        </div>

      ) : (

      /* ════════════════════════════════════════════════════════════════════ */
      /* COMMERCIAL FLOW — 3 steps                                           */
      /* Step 1: Contact info                                                */
      /* Step 2: Property type + sq ft + frequency + address                */
      /* Step 3: Scheduling + notes + media + summary + submit              */
      /* ════════════════════════════════════════════════════════════════════ */
        <div className="space-y-6">

          {/* Progress */}
          <div>
            <p className="text-sm font-medium text-slate-900">Step {comStep} of 3</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
              <div className="h-1.5 rounded-full bg-(--color-brand)" style={{ width: `${(comStep / 3) * 100}%` }} />
            </div>
          </div>

          {/* Step 1 — Contact info */}
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

          {/* Step 2 — Property details */}
          {comStep === 2 ? (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-slate-900">About your space</h2>

              <div>
                <p className="mb-2 font-medium text-slate-900">Property Type</p>
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                  {([
                    ['office', 'Office'],
                    ['retail', 'Retail'],
                    ['warehouse', 'Warehouse'],
                    ['other', 'Other'],
                  ] as const).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPropertyType(id)}
                      className={cn(
                        'cursor-pointer rounded-xl border px-4 py-3 text-left transition-colors duration-200',
                        propertyType === id
                          ? 'border-(--color-brand) bg-(--color-brand-muted)/40 ring-1 ring-(--color-brand)'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <p className={cn('text-sm font-semibold', propertyType === id ? 'text-(--color-brand)' : 'text-slate-900')}>
                        {label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-900">Approximate Square Footage</span>
                <Input
                  type="number"
                  placeholder="e.g. 2000"
                  value={squareFootage}
                  onChange={(e) => setSquareFootage(e.target.value)}
                />
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

          {/* Step 3 — Scheduling + notes + media + summary + submit */}
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

              {/* Commercial summary */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Submission Summary</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Business</p>
                    <p className="font-medium text-slate-900">{businessName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Property type</p>
                    <p className="font-medium text-slate-900 capitalize">{propertyType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Square footage</p>
                    <p className="font-medium text-slate-900">{squareFootage ? `~${Number(squareFootage).toLocaleString()} sq ft` : 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Frequency</p>
                    <p className="font-medium text-slate-900">
                      {comFrequency === 'one_time' ? 'One-time' : comFrequency === 'weekly' ? 'Weekly' : comFrequency === 'bi_weekly' ? 'Bi-weekly' : 'Monthly'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="font-medium text-slate-900">{comAddress || '—'}</p>
                  </div>
                </div>
              </div>

              <Button type="button" size="lg" className="w-full" disabled={submitting} onClick={submitCommercial}>
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : 'Submit for Review'}
              </Button>
            </div>
          ) : null}

          {/* Back / Next */}
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
