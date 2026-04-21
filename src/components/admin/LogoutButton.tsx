'use client'

import * as React from 'react'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const [loading, setLoading] = React.useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
    >
      <LogOut size={14} />
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
