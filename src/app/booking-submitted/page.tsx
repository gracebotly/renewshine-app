'use client'

import * as React from 'react'
import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import { CheckCircle, Clock, Mail, Phone, ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

function SubmittedContent() {
  const params = useSearchParams()
  const name    = params.get('name')  ?? ''
  const email   = params.get('email') ?? ''
  const phone   = params.get('phone') ?? ''
  const jobId   = params.get('jobId') ?? ''
  const firstName = name.split(' ')[0] ?? 'there'

  // Email correction state
  const [showEmailFix, setShowEmailFix]   = React.useState(false)
  const [newEmail, setNewEmail]           = React.useState('')
  const [fixStatus, setFixStatus]         = React.useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [displayEmail, setDisplayEmail]   = React.useState(email)

  const handleEmailFix = async () => {
    if (!newEmail.trim() || !jobId) return
    setFixStatus('loading')
    try {
      const res = await fetch('/api/update-job-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, newEmail: newEmail.trim() }),
      })
      if (!res.ok) throw new Error('Failed')
      setDisplayEmail(newEmail.trim())
      setFixStatus('done')
      setShowEmailFix(false)
      setNewEmail('')
    } catch {
      setFixStatus('error')
    }
  }

  return (
    <section className="min-h-screen bg-white py-20">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-6"
        >
          {/* Logo mark */}
          <div className="flex justify-center mb-2">
            <Image src="/logo-mark.svg" alt="RenewShine" width={48} height={48} className="w-12 h-12" />
          </div>

          {/* Success icon */}
          <CheckCircle size={48} className="mx-auto text-emerald-500" />

          {/* Heading */}
          <h1 className="font-display text-3xl font-bold text-slate-900">
            {firstName ? `Got it, ${firstName}!` : 'Request Received!'}
          </h1>
          <p className="text-slate-600">
            We&apos;re reviewing your photos now. You&apos;ll hear from us as soon as possible.
          </p>

          {/* Contact confirmation + email correction */}
          {(displayEmail || phone) && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-left space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                We&apos;ll reach you at
              </p>

              {displayEmail && (
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-slate-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-900 break-all">{displayEmail}</span>
                </div>
              )}

              {phone && (
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-700">{phone}</span>
                </div>
              )}

              {/* Email correction — inline, no wizard restart */}
              {fixStatus === 'done' ? (
                <p className="text-xs text-emerald-600 font-medium pt-1">
                  ✓ Email updated — confirmation resent to {displayEmail}
                </p>
              ) : !showEmailFix ? (
                <p className="text-xs text-slate-500 pt-1">
                  Email look wrong?{' '}
                  <button
                    type="button"
                    onClick={() => setShowEmailFix(true)}
                    className="underline text-slate-600 hover:text-slate-900 transition-colors duration-200 cursor-pointer"
                  >
                    Fix it here
                  </button>
                </p>
              ) : (
                <div className="pt-1 space-y-2">
                  <p className="text-xs font-medium text-slate-700">Enter the correct email:</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="correct@email.com"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') void handleEmailFix() }}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-(--color-brand)"
                    />
                    <button
                      type="button"
                      onClick={() => void handleEmailFix()}
                      disabled={fixStatus === 'loading' || !newEmail.trim()}
                      className="cursor-pointer rounded-lg bg-(--color-brand) px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-(--color-brand-hover) disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {fixStatus === 'loading' ? '…' : 'Update'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowEmailFix(false); setNewEmail(''); setFixStatus('idle') }}
                      className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition-colors duration-200 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                  {fixStatus === 'error' && (
                    <p className="text-xs text-red-600">Something went wrong. Please email us directly.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* What happens next */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-left space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              What happens next
            </p>
            <div className="flex items-start gap-3">
              <ClipboardCheck size={15} className="text-brand mt-0.5 shrink-0" />
              <span className="text-sm text-slate-700">
                We&apos;ll review your photos and confirm your exact price
              </span>
            </div>
            <div className="flex items-start gap-3">
              <Mail size={15} className="text-brand mt-0.5 shrink-0" />
              <span className="text-sm text-slate-700">
                We&apos;ll reach out by your preferred contact method with your quote
              </span>
            </div>
          </div>

          {/* Status checklist */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-left">
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                Details submitted
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                Photos uploaded
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                Availability noted
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="text-amber-500 shrink-0" />
                Quote incoming — check your email
              </li>
            </ul>
          </div>

          <Button asChild variant="ghost">
            <Link href="/">Back to Home</Link>
          </Button>

          <p className="text-xs text-slate-300 pt-4">
            <Link href="/admin/login" className="hover:text-slate-500 transition-colors duration-200">
              Admin login
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default function BookingSubmittedPage() {
  return (
    <Suspense>
      <SubmittedContent />
    </Suspense>
  )
}
