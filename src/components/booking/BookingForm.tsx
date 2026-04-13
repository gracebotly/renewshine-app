'use client'

import * as React from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Minus, Plus } from 'lucide-react'
import { AvailabilityPicker } from '@/components/booking/AvailabilityPicker'
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

export function BookingForm() {
  const router = useRouter()
  const [flowType, setFlowType] = React.useState<FlowType>('residential')
  const [resStep, setResStep] = React.useState(1)
  const [comStep, setComStep] = React.useState(1)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState('')
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const [bedrooms, setBedrooms] = React.useState(2)
  const [bathrooms, setBathrooms] = React.useState(1)
  const [serviceType, setServiceType] = React.useState<ServiceType>('standard')
  const [selectedAddOns, setSelectedAddOns] = React.useState<string[]>([])
  const [resFrequency, setResFrequency] = React.useState<Frequency>('one_time')
  const [resAddress, setResAddress] = React.useState('')
  const [resStartDate, setResStartDate] = React.useState('')
  const [resEndDate, setResEndDate] = React.useState('')
  const [resTimePref, setResTimePref] = React.useState<TimePreference | ''>('')
  const [resName, setResName] = React.useState('')
  const [resEmail, setResEmail] = React.useState('')
  const [resPhone, setResPhone] = React.useState('')
  const [resMediaUrls, setResMediaUrls] = React.useState<string[]>([])

  const [businessName, setBusinessName] = React.useState('')
  const [contactName, setContactName] = React.useState('')
  const [comEmail, setComEmail] = React.useState('')
  const [comPhone, setComPhone] = React.useState('')
  const [propertyType, setPropertyType] = React.useState<'office' | 'retail' | 'warehouse' | 'other'>('office')
  const [squareFootage, setSquareFootage] = React.useState('')
  const [condition, setCondition] = React.useState<'good' | 'fair' | 'needs_work'>('good')
  const [comFrequency, setComFrequency] = React.useState<Frequency>('one_time')
  const [comAddress, setComAddress] = React.useState('')
  const [comStartDate, setComStartDate] = React.useState('')
  const [comEndDate, setComEndDate] = React.useState('')
  const [comTimePref, setComTimePref] = React.useState<TimePreference | ''>('')
  const [comNotes, setComNotes] = React.useState('')
  const [comMediaUrls, setComMediaUrls] = React.useState<string[]>([])

  const estimate = serviceType === 'move_out' ? null : estimatePrice(bedrooms, bathrooms, serviceType, selectedAddOns)

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  const validateResidentialStep = () => {
    const nextErrors: Record<string, string> = {}
    if (resStep === 3 && !resAddress.trim()) nextErrors.resAddress = 'Address is required'
    if (resStep === 4) {
      if (!resStartDate) nextErrors.resStartDate = 'Earliest date is required'
      if (!resEndDate) nextErrors.resEndDate = 'Latest date is required'
      if (!resTimePref) nextErrors.resTimePref = 'Time preference is required'
    }
    if (resStep === 5) {
      if (!resName.trim()) nextErrors.resName = 'Name is required'
      if (!resEmail.trim()) nextErrors.resEmail = 'Email is required'
      if (!resPhone.trim()) nextErrors.resPhone = 'Phone is required'
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
      if (!comPhone.trim()) nextErrors.comPhone = 'Phone is required'
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
          client_phone: resPhone,
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
          notes: '',
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
          client_phone: comPhone,
          business_name: businessName,
          address: comAddress,
          square_footage: squareFootage ? Number(squareFootage) : null,
          condition,
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

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 p-5 sm:p-6">
      <div className="flex gap-2">
        {(['residential', 'commercial'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setFlowType(type)
              setErrors({})
              setSubmitError('')
            }}
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

      {flowType === 'residential' ? (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-slate-900">Step {resStep} of 5</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
              <div className="h-1.5 rounded-full bg-(--color-brand)" style={{ width: `${(resStep / 5) * 100}%` }} />
            </div>
          </div>

          {resStep === 1 ? (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-slate-900">How big is your home?</h2>
              {[
                {
                  label: 'Bedrooms',
                  value: bedrooms,
                  min: 1,
                  max: 6,
                  set: setBedrooms,
                },
                {
                  label: 'Bathrooms',
                  value: bathrooms,
                  min: 0,
                  max: 4,
                  set: setBathrooms,
                },
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
                    <span className="w-8 text-center font-mono text-xl font-bold tabular-nums text-slate-900">{item.value}</span>
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
          ) : null}

          {resStep === 2 ? (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-slate-900">Choose service details</h2>
              <div className="space-y-3">
                {[
                  ['standard', 'Standard Clean', 'from $200'],
                  ['detailed', 'Detailed Clean', 'from $350'],
                  ['move_out', 'Move-In / Move-Out', 'from $500'],
                ].map(([id, title, price]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setServiceType(id as ServiceType)}
                    className={cn(
                      'w-full cursor-pointer rounded-xl border p-4 text-left transition-colors duration-200',
                      serviceType === id
                        ? 'border-(--color-brand) border-2 bg-(--color-brand-muted)/30'
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

          {resStep === 3 ? (
            <div className="space-y-4">
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

              {serviceType === 'move_out' ? (
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Move-In/Move-Out pricing is always confirmed after we review your submission. We&apos;ll send your quote within
                  24 hours.
                </p>
              ) : (
                <PriceEstimate low={estimate?.low ?? 0} high={estimate?.high ?? 0} />
              )}
            </div>
          ) : null}

          {resStep === 4 ? (
            <div>
              <AvailabilityPicker
                startDate={resStartDate}
                endDate={resEndDate}
                timePreference={resTimePref}
                onStartDateChange={setResStartDate}
                onEndDateChange={setResEndDate}
                onTimePreferenceChange={setResTimePref}
              />
              {errors.resStartDate || errors.resEndDate || errors.resTimePref ? (
                <p className="mt-2 text-sm text-red-600">Please complete all availability fields.</p>
              ) : null}
            </div>
          ) : null}

          {resStep === 5 ? (
            <div className="space-y-4">
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-900">Full Name</span>
                <Input value={resName} onChange={(e) => setResName(e.target.value)} error={Boolean(errors.resName)} />
                {errors.resName ? <p className="text-sm text-red-600">{errors.resName}</p> : null}
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-900">Email Address</span>
                <Input
                  type="email"
                  value={resEmail}
                  onChange={(e) => setResEmail(e.target.value)}
                  error={Boolean(errors.resEmail)}
                />
                {errors.resEmail ? <p className="text-sm text-red-600">{errors.resEmail}</p> : null}
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-900">Phone Number</span>
                <Input
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={resPhone}
                  onChange={(e) => setResPhone(e.target.value)}
                  error={Boolean(errors.resPhone)}
                />
                {errors.resPhone ? <p className="text-sm text-red-600">{errors.resPhone}</p> : null}
              </label>

              <MediaUpload onUpload={setResMediaUrls} uploadedUrls={resMediaUrls} />

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
                  resStartDate && resEndDate
                    ? `${new Date(resStartDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(resEndDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
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
                        <p className="text-xs text-slate-500">Arrival window</p>
                        <p className="font-medium text-slate-900">{timeLabel}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500">Address</p>
                        <p className="font-medium text-slate-900">{resAddress || '—'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500">Requested dates</p>
                        <p className="font-medium text-slate-900">{dateLabel}</p>
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

          <div className="flex justify-between gap-3">
            <Button type="button" variant="outline" onClick={() => setResStep((s) => Math.max(1, s - 1))} disabled={resStep === 1 || submitting}>
              Back
            </Button>
            {resStep < 5 ? (
              <Button
                type="button"
                onClick={() => {
                  if (validateResidentialStep()) setResStep((s) => Math.min(5, s + 1))
                }}
                disabled={submitting}
              >
                Next
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-slate-900">Step {comStep} of 4</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
              <div className="h-1.5 rounded-full bg-(--color-brand)" style={{ width: `${(comStep / 4) * 100}%` }} />
            </div>
          </div>

          {comStep === 1 ? (
            <div className="space-y-3">
              <label className="space-y-1"><span className="text-sm font-medium text-slate-900">Business Name</span><Input value={businessName} onChange={(e)=>setBusinessName(e.target.value)} error={Boolean(errors.businessName)} /></label>
              <label className="space-y-1"><span className="text-sm font-medium text-slate-900">Contact Name</span><Input value={contactName} onChange={(e)=>setContactName(e.target.value)} error={Boolean(errors.contactName)} /></label>
              <label className="space-y-1"><span className="text-sm font-medium text-slate-900">Email</span><Input type="email" value={comEmail} onChange={(e)=>setComEmail(e.target.value)} error={Boolean(errors.comEmail)} /></label>
              <label className="space-y-1"><span className="text-sm font-medium text-slate-900">Phone</span><Input type="tel" value={comPhone} onChange={(e)=>setComPhone(e.target.value)} error={Boolean(errors.comPhone)} /></label>
            </div>
          ) : null}

          {comStep === 2 ? (
            <div className="space-y-4">
              <div>
                <p className="mb-2 font-medium text-slate-900">Property Type</p>
                <div className="grid gap-2 sm:grid-cols-4">
                  {['office', 'retail', 'warehouse', 'other'].map((p) => (
                    <button key={p} type="button" onClick={() => setPropertyType(p as typeof propertyType)} className={cn('cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-200', propertyType === p ? 'border-(--color-brand) bg-(--color-brand) text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50')}>{p[0].toUpperCase() + p.slice(1)}</button>
                  ))}
                </div>
              </div>
              <label className="space-y-1"><span className="text-sm font-medium text-slate-900">Square Footage</span><Input type="number" placeholder="e.g. 2000" value={squareFootage} onChange={(e)=>setSquareFootage(e.target.value)} /></label>
              <div>
                <p className="mb-2 font-medium text-slate-900">Condition</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    ['good', 'Good'],
                    ['fair', 'Fair'],
                    ['needs_work', 'Needs Work'],
                  ].map(([id, label]) => (
                    <button key={id} type="button" onClick={() => setCondition(id as typeof condition)} className={cn('cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-200', condition === id ? 'border-(--color-brand) bg-(--color-brand) text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50')}>{label}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 font-medium text-slate-900">Frequency</p>
                <div className="grid gap-2 sm:grid-cols-4">
                  {frequencies.map((f) => (
                    <button key={f.id} type="button" onClick={() => setComFrequency(f.id)} className={cn('cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-200', comFrequency === f.id ? 'border-(--color-brand) bg-(--color-brand) text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50')}>{f.label}</button>
                  ))}
                </div>
              </div>
              <label className="space-y-1"><span className="text-sm font-medium text-slate-900">Address</span><Input value={comAddress} onChange={(e)=>setComAddress(e.target.value)} error={Boolean(errors.comAddress)} /></label>
            </div>
          ) : null}

          {comStep === 3 ? (
            <div className="space-y-4">
              <AvailabilityPicker
                startDate={comStartDate}
                endDate={comEndDate}
                timePreference={comTimePref}
                onStartDateChange={setComStartDate}
                onEndDateChange={setComEndDate}
                onTimePreferenceChange={setComTimePref}
              />
              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-900">Notes</span>
                <textarea
                  className="flex min-h-[100px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 hover:border-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:ring-offset-0"
                  placeholder="Any special instructions, access notes, or details about the space..."
                  value={comNotes}
                  onChange={(e) => setComNotes(e.target.value)}
                />
              </div>
            </div>
          ) : null}

          {comStep === 4 ? (
            <div className="space-y-4">
              <MediaUpload onUpload={setComMediaUrls} uploadedUrls={comMediaUrls} />

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p>Property type: {propertyType}</p>
                <p>Square footage: {squareFootage || 'N/A'}</p>
                <p>Condition: {condition}</p>
                <p>Frequency: {comFrequency}</p>
                <p>Address: {comAddress}</p>
                <p>Availability: {comStartDate} to {comEndDate}</p>
              </div>

              <Button type="button" size="lg" className="w-full" disabled={submitting} onClick={submitCommercial}>
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : 'Submit for Review'}
              </Button>
            </div>
          ) : null}

          <div className="flex justify-between gap-3">
            <Button type="button" variant="outline" onClick={() => setComStep((s) => Math.max(1, s - 1))} disabled={comStep === 1 || submitting}>
              Back
            </Button>
            {comStep < 4 ? (
              <Button type="button" onClick={() => { if (validateCommercialStep()) setComStep((s) => Math.min(4, s + 1)) }} disabled={submitting}>
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
