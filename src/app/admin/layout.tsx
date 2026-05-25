'use client'

import { useEffect } from 'react'
import { PushSetup } from '@/components/admin/PushSetup'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // When the tab comes back to the foreground (after iPhone suspends it),
    // silently refresh the Supabase session so middleware doesn't redirect to login.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        supabaseBrowser.auth.getSession()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return (
    <div className="flex flex-col" style={{ minHeight: '100svh' }}>
      <PushSetup />
      {children}
    </div>
  )
}
