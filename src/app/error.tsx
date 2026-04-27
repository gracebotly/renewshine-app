'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Route error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-white px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertCircle size={22} className="text-red-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-900">Something went wrong</h2>
        <p className="mt-3 text-slate-600">
          We hit an unexpected error. Try again — if the problem continues,
          email us at{' '}
          <a href="mailto:hello@renewshine.co" className="text-(--color-brand) underline underline-offset-2">
            hello@renewshine.co
          </a>.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={reset} className="inline-flex items-center gap-2">
            <RefreshCw size={14} />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
