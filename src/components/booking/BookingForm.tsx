'use client'

import * as React from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Building2, Check, CheckCircle, ChevronLeft, ChevronRight, HardHat, Home, Loader2, Minus, Plus } from 'lucide-react'
import { AvailabilityPicker, type SchedulingMode } from '@/components/booking/AvailabilityPicker'
import { MediaUpload } from '@/components/booking/MediaUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ADD_ONS_FOR_SERVICE, type ServiceType, type TimePreference } from '@/lib/pricing'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
type Frequency = 'one_time' | 'weekly' | 'bi_weekly' | 'monthly'
type FlowType = 'residential' | 'commercial' | 'post_construction'
type PetOption = 'none' | 'cat' | 'dog' | 'other'
type ConditionOption = 'maintained' | 'some_buildup' | 'heavy_buildup' | 'reset'

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
  const [bookingTypeLocked, setBookingTypeLocked] = React.useState(false)

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
  const [resPhone, setResPhone] = React.useState('')
  // Shared contact data — persists across tab switches on Step 1
  const [sharedName, setSharedName] = React.useState('')
  const [sharedEmail, setSharedEmail] = React.useState('')
  const [sharedPhone, setSharedPhone] = React.useState('')
  const [sharedSmsOptIn, setSharedSmsOptIn] = React.useState(false)
  const [sharedTermsAgreed, setSharedTermsAgreed] = React.useState(true)
  // Consent checkboxes — shared across all flows
  const [smsOptIn, setSmsOptIn] = React.useState(false)
  const [termsAgreed, setTermsAgreed] = React.useState(true)

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
  const [comSchedulingMode, setComSchedulingMode] = React.useState<SchedulingMode>('flexible')

  // Step 5 — final
  const [resNotes, setResNotes] = React.useState('')
  const [resMediaEncoded, setResMediaEncoded] = React.useState<string[]>([])
  const [resPreferredContact, setResPreferredContact] = React.useState<'email' | 'phone' | 'text' | ''>('')

  // ── Commercial state ───────────────────────────────────────────────────────
  const [businessName, setBusinessName] = React.useState('')
  const [contactName, setContactName] = React.useState('')
  const [comEmail, setComEmail] = React.useState('')
  const [comPhone, setComPhone] = React.useState('')
  const [propertyType, setPropertyType] = React.useState<'office' | 'retail' | 'warehouse' | 'other' | 'new_build' | 'renovation' | 'construction' | 'commercial'>('office')
  const [propertyOtherDescription, setPropertyOtherDescription] = React.useState('')
  const [squareFootage, setSquareFootage] = React.useState('')
  const [comFrequency, setComFrequency] = React.useState<Frequency>('one_time')
  const [comAddress, setComAddress] = React.useState('')
  const [comStartDate, setComStartDate] = React.useState('')
  const [comEndDate, setComEndDate] = React.useState('')
  const [comTimePref, setComTimePref] = React.useState<TimePreference | ''>('')
  const [comNotes, setComNotes] = React.useState('')
  const [comMediaEncoded, setComMediaEncoded] = React.useState<string[]>([])

  // ── Derived ────────────────────────────────────────────────────────────────
  const hasResData =
    resStep > 1 || resAddress !== '' || sharedName !== '' || sharedEmail !== '' || sharedPhone !== '' || resMediaEncoded.length > 0

  const hasComData =
    comStep > 1 || businessName !== '' || sharedName !== '' || sharedEmail !== '' || sharedPhone !== '' || comMediaEncoded.length > 0

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
    setResPhone('')
    setSmsOptIn(false)
    setTermsAgreed(true)
    setResNotes('')
    setResMediaEncoded([])
    setPropertyOtherDescription('')
  }

  const resetCommercial = (nextFlow: FlowType = flowType) => {
    setComStep(1)
    setBusinessName('')
    setContactName('')
    setComEmail('')
    setComPhone('')
    setSmsOptIn(false)
    setTermsAgreed(true)
    setPropertyType(nextFlow === 'post_construction' ? 'new_build' : 'office')
    setPropertyOtherDescription('')
    setSquareFootage('')
    setComFrequency('one_time')
    setComAddress('')
    setComStartDate('')
    setComSchedulingMode('flexible')
    setComEndDate('')
    setComTimePref('')
    setComNotes('')
    setComMediaEncoded([])
  }

  const handleTabClick = (target: FlowType) => {
    if (bookingTypeLocked) return
    if (target === flowType) return

    const isOnStep1 =
      (flowType === 'residential' && resStep === 1) ||
      (flowType !== 'residential' && comStep === 1)

    if (isOnStep1) {
      if (flowType === 'residential') {
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
        setResNotes('')
        setResMediaEncoded([])
        setResStep(1)
      } else {
        setPropertyType(target === 'post_construction' ? 'new_build' : 'office')
        setSquareFootage('')
        setComFrequency('one_time')
        setComAddress('')
        setComStartDate('')
        setComEndDate('')
        setComTimePref('')
        setComNotes('')
        setComMediaEncoded([])
        setComStep(1)
      }
      setFlowType(target)
      setErrors({})
      setSubmitError('')
      setPendingSwitch(null)
      return
    }

    setPendingSwitch(target)
  }

  const confirmSwitch = () => {
    if (!pendingSwitch) return
    const type = pendingSwitch
    if (flowType === 'residential') resetResidential()
    else resetCommercial(type)
    setSharedName('')
    setSharedEmail('')
    setSharedPhone('')
    setSharedSmsOptIn(false)
    setSharedTermsAgreed(true)
    setFlowType(type)
    if (type === 'post_construction') {
      setPropertyType('new_build')
    } else {
      setPropertyType('office')
    }
    setPropertyOtherDescription('')
    setPendingSwitch(null)
    setErrors({})
    setSubmitError('')
  }

  // ── Partial save — fires when Step 1 is complete and user clicks Next ──────
  const savePartialLead = async (
    saveType: 'residential' | 'commercial' | 'post_construction' = 'residential'
  ): Promise<string | null> => {
    // If already saved, don't save again
    if (partialJobId) return partialJobId
    setSavingPartial(true)
    try {
      const jobType = saveType === 'residential' ? 'residential' : 'commercial'
      const response = await fetch('/api/create-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: jobType,
          status: 'partial',
          client_name: sharedName || 'Unknown',
          client_email: sharedEmail,
          client_phone: rawPhone(sharedPhone) || null,
          // Include business_name for commercial/post-construction partial records
          ...(jobType === 'commercial' && businessName ? { business_name: businessName } : {}),
          // service_type distinguishes post-construction from generic commercial
          ...(saveType === 'post_construction' ? { service_type: 'post_construction' } : {}),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error('Partial save failed')
      setPartialJobId(data.jobId)
      return data.jobId as string
    } catch {
      // Partial save failure is non-blocking — let the user continue
      console.error('Partial save failed — continuing anyway')
      return null
    } finally {
      setSavingPartial(false)
    }
  }

  // ── Step tracking — fire-and-forget, never blocks user ──────────────────────

  // Residential: maps last_completed_step → label of the step the user was on
  const RES_DROPPED_AT_LABELS: Record<number, string> = {
    1: 'Home Details',
    2: 'Service',
    3: 'Availability',
    4: 'Photos',
  }

  const updatePartialStep = async (
    jobId: string,
    completedStep: number,
    droppedAtLabel: string | null,
    snapshot?: Record<string, unknown>
  ): Promise<void> => {
    try {
      await fetch(`/api/update-job-step/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          last_completed_step: completedStep,
          dropped_at_label: droppedAtLabel,
          // Spread all accumulated form fields — the route allowlist strips
          // anything that shouldn't be written
          ...(snapshot ?? {}),
        }),
      })
    } catch {
      // Non-blocking — step tracking failure never interrupts the booking flow
    }
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateResidentialStep = () => {
    const nextErrors: Record<string, string> = {}

    if (resStep === 1) {
      if (!sharedName.trim()) nextErrors.resName = 'Name is required'
      if (!sharedEmail.trim()) nextErrors.resEmail = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sharedEmail)) nextErrors.resEmail = 'Enter a valid email address'
      if (rawPhone(sharedPhone).length < 10) nextErrors.resPhone = 'Enter a valid 10-digit phone number'
      if (!sharedTermsAgreed) nextErrors.termsAgreed = 'You must agree to the Terms and Privacy Policy to continue'
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
    }


    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const validateCommercialStep = () => {
    const nextErrors: Record<string, string> = {}
    if (comStep === 1) {
      if (!businessName.trim()) nextErrors.businessName = 'Business name is required'
      if (!sharedName.trim()) nextErrors.contactName = 'Contact name is required'
      if (!sharedEmail.trim()) nextErrors.comEmail = 'Email is required'
      if (rawPhone(sharedPhone).length < 10) nextErrors.comPhone = 'Enter a valid 10-digit phone number'
      if (!sharedTermsAgreed) nextErrors.termsAgreed = 'You must agree to the Terms and Privacy Policy to continue'
    }
    if (comStep === 2) {
      if (propertyType === 'other' && !propertyOtherDescription.trim()) {
        nextErrors.propertyOtherDescription = 'Please describe your space'
      }
      if (!comAddress.trim()) nextErrors.comAddress = 'Address is required'
    }
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

    let idForStepTracking = partialJobId

    if (resStep === 1) {
      const savedId = await savePartialLead()
      idForStepTracking = savedId
      setBookingTypeLocked(true)
    }

    setResStep((s) => Math.min(5, s + 1))

    // Build a snapshot of ALL fields filled in so far — each call is cumulative
    // so even if an earlier call failed, the DB catches up on the next step.
    if (idForStepTracking) {
      // Build incrementally based on which step just completed
      const snapshot: Record<string, unknown> = {
        // Step 1 fields always included (contact info)
        client_name: sharedName || 'Unknown',
        client_email: sharedEmail,
        client_phone: rawPhone(sharedPhone) || null,
      }

      if (resStep >= 2) {
        // Step 2 — home details
        Object.assign(snapshot, {
          home_type: resHomeType || null,
          bedrooms,
          bathrooms,
          pets: resPets || null,
          condition: resCondition || null,
        })
      }

      if (resStep >= 3) {
        // Step 3 — service
        Object.assign(snapshot, {
          service_type: serviceType,
          add_ons: selectedAddOns,
          service_frequency: resFrequency,
        })
      }

      if (resStep >= 4) {
        // Step 4 — availability + address
        Object.assign(snapshot, {
          address: resAddress || null,
          availability_start: resStartDate || null,
          availability_end: resEndDate || resStartDate || null,
          availability_time_pref: resTimePref || null,
        })
      }

      void updatePartialStep(
        idForStepTracking,
        resStep,
        RES_DROPPED_AT_LABELS[resStep] ?? null,
        snapshot
      )
    }
  }

  // ── Commercial/Post-Construction Next handler ──────────────────────────────
  const handleComNext = async () => {
    if (!validateCommercialStep()) return

    let idForStepTracking = partialJobId

    if (comStep === 1) {
      const savedId = await savePartialLead(flowType as 'commercial' | 'post_construction')
      idForStepTracking = savedId
      setBookingTypeLocked(true)
    }

    setComStep((s) => Math.min(3, s + 1))

    if (idForStepTracking && comStep < 3) {
      const COM_DROPPED_AT_LABELS: Record<number, string> = {
        1: flowType === 'post_construction' ? 'Project Details' : 'Space Details',
        2: 'Scheduling',
      }

      // Build cumulative snapshot of all commercial fields filled in so far
      const snapshot: Record<string, unknown> = {
        client_name: sharedName || 'Unknown',
        client_email: sharedEmail,
        client_phone: rawPhone(sharedPhone) || null,
        business_name: businessName || null,
      }

      if (comStep >= 2) {
        // Step 2 — space details + address
        Object.assign(snapshot, {
          address: comAddress || null,
          property_type: propertyType || null,
          square_footage: squareFootage ? Number(squareFootage) : null,
        })
      }

      void updatePartialStep(
        idForStepTracking,
        comStep,
        COM_DROPPED_AT_LABELS[comStep] ?? null,
        snapshot
      )
    }
  }

  // ── Submit residential ─────────────────────────────────────────────────────
  const submitResidential = async () => {
    if (!validateResidentialStep()) return
    setSubmitting(true)
    setSubmitError('')

    try {
      const payload = {
        type: 'residential',
        client_name: sharedName,
        client_email: sharedEmail,
        client_phone: rawPhone(sharedPhone),
        sms_opt_in: sharedSmsOptIn,
        address: resAddress,
        service_type: serviceType,
        service_frequency: resFrequency,
        bedrooms,
        bathrooms,
        add_ons: selectedAddOns,
        condition: resCondition || null,
        pets: resPets || null,
        estimated_price_low: 0,
        estimated_price_high: 0,
        availability_start: resStartDate,
        availability_end: resEndDate,
        availability_time_pref: resTimePref,
        media_urls: resMediaEncoded,
        preferred_contact: resPreferredContact,
        home_type: resHomeType || null,
        notes: resNotes || null,
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
      const resData = await response.json()

      const resParams = new URLSearchParams({
        name: sharedName,
        email: sharedEmail,
        phone: rawPhone(sharedPhone),
        jobId: resData.jobId ?? '',
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
          client_name: sharedName,
          client_email: sharedEmail,
          client_phone: rawPhone(sharedPhone),
          sms_opt_in: sharedSmsOptIn,
          business_name: businessName,
          address: comAddress,
          square_footage: squareFootage ? Number(squareFootage) : null,
          condition: null,
          service_frequency: comFrequency,
          availability_start: comStartDate,
          availability_end: comEndDate,
          availability_time_pref: comTimePref,
          media_urls: comMediaEncoded,
          notes: comNotes,
          service_type: flowType === 'post_construction' ? 'post_construction' : null,
          bedrooms: null,
          bathrooms: null,
          add_ons: [],
          estimated_price_low: 0,
          estimated_price_high: 0,
          property_type: propertyType,
          property_other_description:
            propertyType === 'other' ? propertyOtherDescription : null,
        }),
      })
      if (!response.ok) throw new Error('Failed')
      const comData = await response.json()

      const comParams = new URLSearchParams({
        name: sharedName,
        email: sharedEmail,
        phone: rawPhone(sharedPhone),
        jobId: comData.jobId ?? '',
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
    : serviceType === 'deep' ? 'Deep Clean'
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
    <div className="min-h-screen bg-[#F5F3EF]"><div className="w-full max-w-2xl mx-auto px-0 sm:px-4 pt-0 sm:pt-8 pb-16"><div className="bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-slate-100 overflow-hidden flex h-full flex-col">

      {/* ── PINNED HEADER ─────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-slate-100 bg-white px-5 sm:px-8 pt-5 sm:pt-7 pb-4">

        {/* Flow type tabs — ONLY visible on Step 1 */}
        {!bookingTypeLocked && ((flowType === 'residential' && resStep === 1) ||
          (flowType !== 'residential' && comStep === 1)) && (
          <div className="mb-3 flex gap-2 flex-wrap">
            {(['residential', 'commercial', 'post_construction'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTabClick(type)}
                className={cn(
                  'cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200',
                  flowType === type
                    ? 'bg-(--color-brand) text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                )}
              >
                {type === 'residential' ? 'Residential' : type === 'commercial' ? 'Commercial' : 'Post-Construction'}
              </button>
            ))}
          </div>
        )}

        {/* Switch confirmation banner — shown in header when pending */}
        {pendingSwitch ? (
          <div className="mb-3 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                Switch to {pendingSwitch === 'residential' ? 'Residential' : pendingSwitch === 'commercial' ? 'Commercial' : 'Post-Construction'}?
              </p>
              <p className="text-xs text-slate-600">Your current entries will be cleared.</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setPendingSwitch(null)}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={confirmSwitch}
                className="cursor-pointer rounded-lg bg-(--color-brand) px-3 py-1.5 text-xs font-medium text-white transition-colors duration-200 hover:bg-(--color-brand-hover)"
              >
                Switch
              </button>
            </div>
          </div>
        ) : null}

        {/* Progress bar */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-500 font-sans tabular-nums">
            Step {flowType === 'residential' ? `${resStep} of 5` : `${comStep} of 3`}
          </span>
          {bookingTypeLocked ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-muted text-brand text-xs font-medium tracking-wide uppercase font-sans">
              <CheckCircle className="h-3.5 w-3.5" />
              {flowType === 'residential' ? 'Residential Clean' : flowType === 'commercial' ? 'Commercial Clean' : 'Post-Construction'}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-1.5 rounded-full bg-slate-100">
            <div
              className="h-1.5 rounded-full bg-(--color-brand) transition-all duration-300"
              style={{
                width: flowType === 'residential'
                  ? `${(resStep / 5) * 100}%`
                  : `${(comStep / 3) * 100}%`,
              }}
            />
          </div>
          <span className="shrink-0 text-xs font-medium text-slate-500">
            {flowType === 'residential' ? `${resStep} / 5` : `${comStep} / 3`}
          </span>
        </div>

        {/* Step title */}
        {flowType === 'residential' ? (
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 leading-snug">
              {resStep === 1 ? "Let's get started"
                : resStep === 2 ? 'Tell us about your home'
                : resStep === 3 ? 'Choose your service'
                : resStep === 4 ? 'Where and when?'
                : 'Almost done'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {resStep === 1 ? "We'll send your confirmed quote to this email."
                : resStep === 2 ? 'Helps us send the right team with the right supplies.'
                : resStep === 3 ? 'Final price confirmed after we review your photos.'
                : resStep === 4 ? "We'll be in touch as soon as possible to confirm your appointment."
                : "One last thing, then we'll take it from here."}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 leading-snug">
              {comStep === 1
                ? (flowType === 'post_construction' ? 'Tell us about your project' : 'Tell us about your business')
                : comStep === 2
                  ? (flowType === 'post_construction' ? 'About your project' : 'About your space')
                  : 'Scheduling & details'}
            </h2>
          </div>
        )}
      </div>

      {/* ── SCROLLABLE STEP CONTENT ────────────────────────────────────── */}
      {/* This area scrolls independently — the header and footer never move */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 sm:py-8">
        {flowType === 'residential' ? (
          <div className="space-y-5 pb-4">
            {resStep === 1 ? (
              <div className="space-y-5">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-900">Your Name <span className="text-red-500">*</span></span>
                  <Input
                    placeholder="Jane Smith"
                    value={sharedName}
                    onChange={(e) => setSharedName(e.target.value)}
                    error={Boolean(errors.resName)}
                  />
                  {errors.resName ? <p className="text-sm text-red-600">{errors.resName}</p> : null}
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-900">Email Address <span className="text-red-500">*</span></span>
                  <Input
                    type="email"
                    placeholder="jane@email.com"
                    value={sharedEmail}
                    onChange={(e) => setSharedEmail(e.target.value)}
                    error={Boolean(errors.resEmail)}
                  />
                  {errors.resEmail ? <p className="text-sm text-red-600">{errors.resEmail}</p> : null}
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-900">Phone Number <span className="text-red-500">*</span></span>
                  <Input
                    type="tel"
                    placeholder="(301) 555-1234"
                    value={sharedPhone}
                    onChange={(e) => setSharedPhone(formatPhone(e.target.value))}
                    error={Boolean(errors.resPhone)}
                  />
                  {errors.resPhone ? <p className="text-sm text-red-600">{errors.resPhone}</p> : null}
                </label>

                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sharedSmsOptIn}
                      onChange={(e) => setSharedSmsOptIn(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-[hsl(var(--color-brand))]"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      I agree to receive text messages from RenewShine about my booking and quote. Reply STOP to opt out at any time. Message and data rates may apply.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sharedTermsAgreed}
                      onChange={(e) => setSharedTermsAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-[hsl(var(--color-brand))]"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      I have read and agree to the{' '}
                      <a href="/terms" target="_blank" className="underline text-slate-900 hover:text-(--color-brand) transition-colors duration-200">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" target="_blank" className="underline text-slate-900 hover:text-(--color-brand) transition-colors duration-200">
                        Privacy Policy
                      </a>
                      . <span className="text-red-500">*</span>
                    </span>
                  </label>

                  {errors.termsAgreed ? (
                    <p className="text-sm text-red-600">{errors.termsAgreed}</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {resStep === 2 ? (
              <div className="space-y-7">
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

                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-900">Home size</p>
                  {[
                    { label: 'Bedrooms', value: bedrooms, min: 1, max: 6, set: setBedrooms },
                    { label: 'Bathrooms', value: bathrooms, min: 0, max: 8, set: setBathrooms },
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
                        <span className="w-10 text-center font-mono text-xl font-bold tabular-nums text-slate-900">
                          {item.label === 'Bathrooms' && item.value >= 5 ? '5+' : item.value}
                        </span>
                        <button
                          type="button"
                          onClick={() => item.set((v) => Math.min(item.max, v + 1))}
                          disabled={item.label === 'Bathrooms' && item.value >= 8}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 transition-colors duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

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

                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-900">What's the current condition?</p>
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

            {resStep === 3 ? (
              <div className="space-y-5">
                <div className="space-y-3">
                  {([
                    {
                      id: 'standard' as ServiceType,
                      title: 'Standard Clean',
                      desc: 'Maintenance cleaning for regularly kept homes',
                    },
                    {
                      id: 'deep' as ServiceType,
                      title: 'Deep Clean',
                      desc: 'Full top-to-bottom clean — includes inside oven & fridge',
                    },
                    {
                      id: 'move_out' as ServiceType,
                      title: 'Move-In / Move-Out',
                      desc: 'For vacant properties and tenant turnover',
                    },
                  ]).map(({ id, title, desc }) => (
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
                      <div>
                        <p className="font-semibold text-slate-900">{title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

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
              </div>
            ) : null}

            {resStep === 4 ? (
              <div className="space-y-6">
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
              </div>
            ) : null}

            {resStep === 5 ? (
              <div className="space-y-5">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-900">Notes</span>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 hover:border-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:ring-offset-0"
                    placeholder="How do we get in?"
                    value={resNotes}
                    onChange={(e) => setResNotes(e.target.value)}
                  />
                </label>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-slate-900">Show us your space</p>
                  <MediaUpload onUpload={setResMediaEncoded} uploadedEncoded={resMediaEncoded} />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900">Preferred contact</p>
                  <div className="flex items-center gap-5">
                    {([
                      { id: 'email' as const, label: 'Email' },
                      { id: 'phone' as const, label: 'Phone' },
                      { id: 'text' as const, label: 'Text' },
                    ] as const).map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setResPreferredContact(option.id)}
                        className="inline-flex cursor-pointer items-center gap-2 transition-colors duration-200"
                      >
                        <span
                          className={cn(
                            'flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors duration-200',
                            resPreferredContact === option.id
                              ? 'border-(--color-brand)'
                              : 'border-slate-300'
                          )}
                        >
                          {resPreferredContact === option.id ? (
                            <span className="h-2 w-2 rounded-full bg-(--color-brand)" />
                          ) : null}
                        </span>
                        <span className={cn(
                          'text-sm',
                          resPreferredContact === option.id ? 'font-medium text-slate-900' : 'text-slate-600'
                        )}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

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
                    <div>
                      <p className="text-xs text-slate-500">Preferred contact</p>
                      <p className="font-medium text-slate-900">
                        {resPreferredContact === 'email' ? 'Email' : resPreferredContact === 'phone' ? 'Phone' : resPreferredContact === 'text' ? 'Text' : '—'}
                      </p>
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

                <div className="space-y-3">
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
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {comStep === 1 ? (
              <div className="space-y-4">
                <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-900">Business Name <span className="text-red-500">*</span></span>
                <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} error={Boolean(errors.businessName)} />
                {errors.businessName ? <p className="text-sm text-red-600">{errors.businessName}</p> : null}
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-900">Your Name <span className="text-red-500">*</span></span>
                <Input value={sharedName} onChange={(e) => setSharedName(e.target.value)} error={Boolean(errors.contactName)} />
                {errors.contactName ? <p className="text-sm text-red-600">{errors.contactName}</p> : null}
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-900">Email <span className="text-red-500">*</span></span>
                <Input type="email" value={sharedEmail} onChange={(e) => setSharedEmail(e.target.value)} error={Boolean(errors.comEmail)} />
                {errors.comEmail ? <p className="text-sm text-red-600">{errors.comEmail}</p> : null}
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-900">Phone Number <span className="text-red-500">*</span></span>
                <Input
                  type="tel"
                  placeholder="(301) 555-1234"
                  value={sharedPhone}
                  onChange={(e) => setSharedPhone(formatPhone(e.target.value))}
                  error={Boolean(errors.comPhone)}
                />
                {errors.comPhone ? <p className="text-sm text-red-600">{errors.comPhone}</p> : null}
              </label>

              {/* Consent checkboxes — add after the phone label block */}
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sharedSmsOptIn}
                    onChange={(e) => setSharedSmsOptIn(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-[hsl(var(--color-brand))]"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I agree to receive text messages from RenewShine about my booking and quote. Reply STOP to opt out at any time. Message and data rates may apply.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sharedTermsAgreed}
                    onChange={(e) => setSharedTermsAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-[hsl(var(--color-brand))]"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I have read and agree to the{' '}
                    <a href="/terms" target="_blank" className="underline text-slate-900 hover:text-(--color-brand) transition-colors duration-200">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" className="underline text-slate-900 hover:text-(--color-brand) transition-colors duration-200">
                      Privacy Policy
                    </a>
                    . <span className="text-red-500">*</span>
                  </span>
                </label>

                {errors.termsAgreed ? (
                  <p className="text-sm text-red-600">{errors.termsAgreed}</p>
                ) : null}
              </div>
            </div>
          ) : null}

          {comStep === 2 ? (
            <div className="space-y-5">
              <div>
                <p className="mb-2 font-medium text-slate-900">Property Type</p>
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                  {(flowType === 'post_construction'
                  ? ['new_build', 'renovation', 'commercial', 'other'] as const
                  : ['office', 'retail', 'warehouse', 'other'] as const
                ).map((id) => (
                    <TileButton key={id} selected={propertyType === id} onClick={() => setPropertyType(id)}>
                      <p className={cn('text-sm font-semibold capitalize', propertyType === id ? 'text-(--color-brand)' : 'text-slate-900')}>
                        {id.replace('_', ' ')}
                      </p>
                    </TileButton>
                  ))}
                </div>
              </div>
              {propertyType === 'other' && (
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-slate-900">
                    Please describe your space <span className="text-red-500">*</span>
                  </span>
                  <Input
                    type="text"
                    placeholder="e.g. Dance studio, storage facility, medical office…"
                    value={propertyOtherDescription}
                    onChange={(e) => setPropertyOtherDescription(e.target.value)}
                    error={Boolean(errors.propertyOtherDescription)}
                  />
                  {errors.propertyOtherDescription && (
                    <p className="text-sm text-red-600">{errors.propertyOtherDescription}</p>
                  )}
                </label>
              )}
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-900">
                  {flowType === 'post_construction' ? 'Approximate Square Footage (Total Build/Reno Area)' : 'Approximate Square Footage'}
                </span>
                <Input type="number" placeholder="e.g. 2000" value={squareFootage} onChange={(e) => setSquareFootage(e.target.value)} />
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
                schedulingMode={comSchedulingMode}
                onSchedulingModeChange={setComSchedulingMode}
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
                  className="flex min-h-[100px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 hover:border-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:ring-offset-0"
                  placeholder={flowType === 'post_construction'
                    ? 'Project scope, phases complete, dusty areas, access instructions, any special requirements...'
                    : 'Access instructions, security codes, areas of focus, any special requirements...'}
                  value={comNotes}
                  onChange={(e) => setComNotes(e.target.value)}
                />
              </label>
              <MediaUpload onUpload={setComMediaEncoded} uploadedEncoded={comMediaEncoded} />
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Submission Summary</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div><p className="text-xs text-slate-500">Business</p><p className="font-medium text-slate-900">{businessName || '—'}</p></div>
                  <div>
                    <p className="text-xs text-slate-500">Property type</p>
                    <p className="font-medium text-slate-900 capitalize">
                      {propertyType === 'other' && propertyOtherDescription
                        ? `Other — ${propertyOtherDescription}`
                        : propertyType.replace('_', ' ')}
                    </p>
                  </div>
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
                <Button type="button" size="lg" className="w-full" disabled={submitting} onClick={submitCommercial}>
                  {submitting
                    ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                    : flowType === 'post_construction' ? 'Request Post-Construction Quote' : 'Request My Custom Quote'}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
        )}

        {submitError ? <p className="mt-2 text-sm text-red-600">{submitError}</p> : null}
      </div>

      {/* ── PINNED FOOTER — Back / Next ───────────────────────────────── */}
      {/* Only shows Back and Next. Submit stays inside step content above. */}
      <div className="sticky bottom-0 left-0 right-0 shrink-0 border-t border-slate-100 bg-white px-5 sm:px-8 py-4">
        <div className="flex justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (flowType === 'residential') setResStep((s) => Math.max(1, s - 1))
              else setComStep((s) => Math.max(1, s - 1))
            }}
            disabled={
              (flowType === 'residential' && resStep === 1) ||
              (flowType !== 'residential' && comStep === 1) ||
              submitting ||
              savingPartial
            }
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {flowType === 'residential' && resStep < 5 ? (
            <Button
              type="button"
              onClick={handleResNext}
              disabled={submitting || savingPartial}
            >
              {savingPartial
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : <>Continue <ChevronRight className="w-4 h-4" /></>}
            </Button>
          ) : null}

          {flowType !== 'residential' && comStep < 3 ? (
            <Button
              type="button"
              onClick={handleComNext}
              disabled={submitting || savingPartial}
            >
              {savingPartial && comStep === 1
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : <>Continue <ChevronRight className="w-4 h-4" /></>
              }
            </Button>
          ) : null}
        </div>
      </div>
    </div></div></div>
  )
}
