'use client'

import * as React from 'react'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'
import { ALLOWED_ADMIN_EMAILS } from '@/lib/allowed-emails'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'motion/react'
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react'

// Three stages:
// 'form'    — enter email
// 'code'    — enter 6-digit OTP that Supabase sent in the email
// 'success' — signed in, redirecting
type Stage = 'form' | 'code' | 'success'

export default function AdminLoginPage() {
  const [email, setEmail] = React.useState('')
  const [code, setCode] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [stage, setStage] = React.useState<Stage>('form')
  const [resendCooldown, setResendCooldown] = React.useState(0)
  const codeInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // If already logged in, skip straight to admin
  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/admin')
    })
  }, [router])

  // Focus the code input when we enter the code stage
  useEffect(() => {
    if (stage === 'code') {
      setTimeout(() => codeInputRef.current?.focus(), 100)
    }
  }, [stage])

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  // ── Step 1: send OTP to email ─────────────────────────────────────────────
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const normalized = email.trim().toLowerCase()

    setLoading(true)

    const res = await fetch('/api/admin/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalized }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Failed to send code.')
      return
    }

    setStage('code')
    setResendCooldown(60)
  }

  // ── Step 2: verify the 6-digit code ──────────────────────────────────────
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedCode = code.replace(/\s/g, '').trim()

    if (trimmedCode.length !== 6) {
      setError('Please enter the full 6-digit code.')
      return
    }

    setLoading(true)

    const res = await fetch('/api/admin/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), code: trimmedCode }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Verification failed.')
      return
    }

    // Set the Supabase session client-side from the server-issued tokens
    const { error: sessionError } = await supabaseBrowser.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    })

    if (sessionError) {
      setError('Failed to sign in. Try again.')
      return
    }

    setStage('success')
    router.replace('/admin')
  }

  // ── Resend: calls send-otp again, resets cooldown ────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return
    setError('')
    setCode('')
    setLoading(true)

    const res = await fetch('/api/admin/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Failed to resend code.')
      return
    }

    setResendCooldown(60)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

          {/* Logo */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo-mark.svg"
                alt="RenewShine"
                width={40}
                height={40}
                className="w-10 h-10"
              />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Staff Access</h1>
            <p className="mt-1 text-sm text-slate-600">
              {stage === 'form' && 'Enter your email to receive a sign-in code.'}
              {stage === 'code' && 'Enter the 6-digit code from your email.'}
              {stage === 'success' && 'Signed in — redirecting…'}
            </p>
          </div>

          {/* ── Stage: form ── */}
          {stage === 'form' && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-900">Email address</span>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoFocus
                  required
                />
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  'Sending code…'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Mail size={15} />
                    Send sign-in code
                  </span>
                )}
              </Button>
            </form>
          )}

          {/* ── Stage: code ── */}
          {stage === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">

              {/* Email reminder */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Code sent to</p>
                <p className="text-sm font-medium text-slate-900 truncate">{email}</p>
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-900">6-digit code</span>
                <Input
                  ref={codeInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    // Strip non-digits as you type
                    setCode(e.target.value.replace(/\D/g, ''))
                    setError('')
                  }}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest font-mono"
                  autoComplete="one-time-code"
                  required
                />
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={loading || code.length !== 6}
              >
                {loading ? 'Verifying…' : 'Sign in'}
              </Button>

              {/* Resend + back */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStage('form')
                    setCode('')
                    setError('')
                  }}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition-colors duration-200"
                >
                  <ArrowLeft size={12} />
                  Change email
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}

          {/* ── Stage: success ── */}
          {stage === 'success' && (
            <div className="flex flex-col items-center gap-3 py-2">
              <CheckCircle size={40} className="text-emerald-500" />
              <p className="text-sm text-slate-600">Taking you to the dashboard…</p>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  )
}
