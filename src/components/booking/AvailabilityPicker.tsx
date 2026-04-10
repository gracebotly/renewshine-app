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

const timeOptions: Array<{ id: TimePreference; label: string }> = [
  { id: 'morning', label: 'Morning (8am–12pm)' },
  { id: 'afternoon', label: 'Afternoon (12pm–5pm)' },
  { id: 'flexible', label: 'Flexible (Any Time)' },
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
    <div className="space-y-4">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <CalendarRange size={16} className="text-(--color-brand)" />
          When works for you?
        </p>
        <p className="mt-1 text-sm text-slate-600">Give us a window — we&apos;ll confirm the exact date within 24 hours.</p>
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

      <div className="grid gap-2 sm:grid-cols-3">
        {timeOptions.map((option) => {
          const isSelected = timePreference === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onTimePreferenceChange(option.id)}
              className={cn(
                'cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-200',
                isSelected
                  ? 'border-(--color-brand) bg-(--color-brand) text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <span className="inline-flex items-center gap-2">
                <Clock size={14} />
                {option.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
