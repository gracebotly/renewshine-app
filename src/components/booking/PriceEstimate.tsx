interface PriceEstimateProps {
  low: number
  high: number
  compact?: boolean
}

export function PriceEstimate({ low, high, compact = false }: PriceEstimateProps) {
  if (low <= 0) return null

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-(--color-brand-muted) bg-(--color-brand-muted) px-4 py-2.5">
        <p className="font-mono text-base font-bold tabular-nums text-(--color-brand)">
          Est. ${low} – ${high}
        </p>
        <span className="text-xs text-slate-500">Final confirmed after photo review</span>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-(--color-brand-muted) p-5">
      <p className="font-mono text-2xl font-bold tabular-nums text-(--color-brand)">
        Estimated: ${low} – ${high}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Final price confirmed within 24 hours after we review your photos
      </p>
    </div>
  )
}
