'use client'

import { CalendarRange, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { TimePreference } from '@/lib/pricing'

export type SchedulingMode = 'specific' | 'flexible'

interface AvailabilityPickerProps {
  schedulingMode: SchedulingMode
  onSchedulingModeChange: (mode: SchedulingMode) => void
  startDate: string
  endDate: string
  timePreference: TimePreference | ''
  onStartDateChange: (val: string) => void
  onEndDateChange: (val: string) => void
  onTimePreferenceChange: (val: TimePreference) => void
}

const timeOptions: Array<{ id: TimePreference; label: string }> = [
  { id: 'early_morning', label: '8am – 10am' },
  { id: 'mid_morning', label: '10am – 12pm' },
  { id: 'noon', label: '12pm – 2pm' },
  { id: 'early_afternoon', label: '2pm – 4pm' },
  { id: 'late_afternoon', label: '4pm – 6pm' },
  { id: 'flexible', label: 'Flexible' },
]

export function AvailabilityPicker({
  schedulingMode,
  onSchedulingModeChange,
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
      {/* Section header */}
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <CalendarRange size={16} className="text-(--color-brand)" />
          When works for you?
        </p>
      </div>

      {/* Scheduling mode toggle — labels only, no subtitles */}
      <div className="grid grid-cols-2 gap-2">
        {([
          { id: 'specific' as SchedulingMode, label: 'I have a specific date' },
          { id: 'flexible' as SchedulingMode, label: "I'm flexible" },
        ] as const).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSchedulingModeChange(option.id)}
            className={cn(
              'cursor-pointer rounded-xl border px-4 py-3 text-left transition-colors duration-200',
              schedulingMode === option.id
                ? 'border-(--color-brand) bg-(--color-brand-muted)/40 ring-1 ring-(--color-brand)'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            <p
              className={cn(
                'text-sm font-semibold',
                schedulingMode === option.id
                  ? 'text-(--color-brand)'
                  : 'text-slate-900'
              )}
            >
              {option.label}
            </p>
          </button>
        ))}
      </div>

      {/* Date input — specific mode */}
      {schedulingMode === 'specific' ? (
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-900">Preferred Date</span>
          <Input
            type="date"
            min={today}
            value={startDate}
            onChange={(e) => {
              onStartDateChange(e.target.value)
              onEndDateChange(e.target.value)
            }}
          />
        </label>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-900">Earliest Date</span>
            <Input
              type="date"
              min={today}
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
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
      )}

      {/* Time window — labels only, no subtitles */}
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
                <p
                  className={cn(
                    'text-sm font-semibold tabular-nums',
                    isSelected ? 'text-(--color-brand)' : 'text-slate-900'
                  )}
                >
                  {option.label}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
