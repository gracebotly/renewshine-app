interface PriceEstimateProps {
  low: number
  high: number
}

export function PriceEstimate({ low, high }: PriceEstimateProps) {
  if (low <= 0) return null

  return (
    <div className="rounded-xl bg-(--color-brand-muted) p-5">
      <p className="font-mono text-2xl font-bold tabular-nums text-(--color-brand)">
        Estimated: ${low} – ${high}
      </p>
      <p className="mt-1 text-sm text-slate-600">Final price confirmed within 24 hours after we review your photos</p>
    </div>
  )
}
