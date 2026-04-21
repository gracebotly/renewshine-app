'use client'

import * as React from 'react'
import { useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'
import { ALLOWED_ADMIN_EMAILS } from '@/lib/allowed-emails'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'motion/react'
import { Mail, CheckCircle } from 'lucide-react'

type Stage = 'form' | 'sent'

export default function AdminLoginPage() {
  const [email, setEmail] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [stage, setStage] = React.useState<Stage>('form')

  const router = useRouter()

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/admin')
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const normalized = email.trim().toLowerCase()

    // Allowlist check — never send a magic link to unknown emails
    if (!ALLOWED_ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(normalized)) {
      setError('This email is not authorized to access the admin panel.')
      return
    }

    setLoading(true)

    const { error: authError } = await supabaseBrowser.auth.signInWithOtp({
      email: normalized,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: false, // Never create new Supabase users — staff must already exist
      },
    })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    setStage('sent')
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
              {stage === 'form'
                ? 'Enter your email to receive a sign-in link.'
                : 'Check your inbox.'}
            </p>
          </div>

          {stage === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              {error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : null}

              <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                {loading ? (
                  'Sending link…'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Mail size={15} />
                    Send sign-in link
                  </span>
                )}
              </Button>
            </form>
          ) : (
            /* Sent state — clean confirmation */
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Link sent to</p>
                <p className="text-sm text-slate-600 mt-0.5 break-all">{email}</p>
              </div>
              <p className="text-sm text-slate-500">
                Click the link in your email to sign in. You can close this tab.
              </p>
              <button
                type="button"
                onClick={() => { setStage('form'); setEmail(''); setError('') }}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors duration-200 cursor-pointer"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
