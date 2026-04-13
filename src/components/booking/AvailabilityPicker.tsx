'use client'

import { CalendarRange, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { TimePreference } from '@/lib/pricing'

interface AvailabilityPickerProps {
  startDate: string
  endDate: string
  timePreference: TimePreference | ''
  onStartDateChange: (val: string) => void
  onEndDateChange: (val: string) => void
  onTimePreferenceChange: (val: TimePreference) => void
}

const timeOptions: Array<{ id: TimePreference; label: string; sub: string }> = [
  { id: 'early_morning', label: '8am – 10am', sub: 'Early morning' },
  { id: 'mid_morning', label: '10am – 12pm', sub: 'Mid morning' },
  { id: 'noon', label: '12pm – 2pm', sub: 'Midday' },
  { id: 'early_afternoon', label: '2pm – 4pm', sub: 'Early afternoon' },
  { id: 'late_afternoon', label: '4pm – 6pm', sub: 'Late afternoon' },
  { id: 'flexible', label: 'Flexible', sub: 'Any time works' },
]

export function AvailabilityPicker({
  startDate,
  endDate,
  timePreference,
  onStartDateChange,
  onEndDateChange,
  onTimePreferenceChange,
}: AvailabilityPickerProps) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-5">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <CalendarRange size={16} className="text-(--color-brand)" />
          When works for you?
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Give us a date range — we&apos;ll confirm your exact appointment within 24 hours.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-900">Earliest Date</span>
          <Input type="date" min={today} value={startDate} onChange={(e) => onStartDateChange(e.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-900">Latest Date</span>
          <Input
            type="date"
            min={startDate || today}
            value={endDate}
            onChange={(e) => {
              const next = e.target.value
              if (startDate && next && next < startDate) return
              onEndDateChange(next)
            }}
          />
        </label>
      </div>

      <div>
        <p className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-900">
          <Clock size={14} className="text-(--color-brand)" />
          Preferred arrival window
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {timeOptions.map((option) => {
            const isSelected = timePreference === option.id
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onTimePreferenceChange(option.id)}
                className={cn(
                  'cursor-pointer rounded-xl border px-4 py-3 text-left transition-colors duration-200',
                  isSelected
                    ? 'border-(--color-brand) bg-(--color-brand-muted)/40 ring-1 ring-(--color-brand)'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <p className={cn('text-sm font-semibold tabular-nums', isSelected ? 'text-(--color-brand)' : 'text-slate-900')}>
                  {option.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{option.sub}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
