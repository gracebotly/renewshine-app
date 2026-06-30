'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronLeft, Check, RotateCcw } from 'lucide-react'
import { TEMPLATE_LABELS, TEMPLATE_TOKENS } from '@/lib/templates/types'
import type { TemplateId, TemplateChannel, MessageTemplate } from '@/lib/templates/types'
import { DEFAULT_TEMPLATES } from '@/lib/templates/defaults'

const TEMPLATE_ORDER: TemplateId[] = ['photos', 'quote_dep', 'quote_dep_bullets', 'quote_dep_next_steps', 'quote_no', 'appt', 'reminder', 'invoice']
const CHANNELS_BY_TEMPLATE: Record<TemplateId, TemplateChannel[]> = {
  photos: ['email', 'sms'],
  quote_dep: ['email', 'sms'],
  quote_dep_bullets: ['email'],
  quote_dep_next_steps: ['email'],
  quote_no: ['email', 'sms'],
  appt: ['email', 'sms'],
  reminder: ['email', 'sms'],
  invoice: ['email', 'sms'],
}

function findTemplate(list: MessageTemplate[], id: TemplateId, channel: TemplateChannel) {
  return list.find(t => t.templateId === id && t.channel === channel)
    ?? DEFAULT_TEMPLATES.find(t => t.templateId === id && t.channel === channel)!
}

function ChannelEditor({
  templateId,
  channel,
  template,
  onSaved,
}: {
  templateId: TemplateId
  channel: TemplateChannel
  template: MessageTemplate
  onSaved: (t: MessageTemplate) => void
}) {
  const [subject, setSubject] = React.useState(template.subject ?? '')
  const [body, setBody] = React.useState(template.body)
  const [saving, setSaving] = React.useState(false)
  const [resetting, setResetting] = React.useState(false)
  const [savedFlash, setSavedFlash] = React.useState(false)
  const [error, setError] = React.useState('')

  // Keep local state in sync if the parent reloads templates (e.g. after reset)
  React.useEffect(() => {
    setSubject(template.subject ?? '')
    setBody(template.body)
  }, [template])

  const isEmail = channel === 'email'
  const tokens = TEMPLATE_TOKENS[templateId]
  const dirty = body !== template.body || (isEmail && subject !== (template.subject ?? ''))

  async function handleSave() {
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, channel, subject: isEmail ? subject : null, body }),
    })
    if (res.ok) {
      onSaved({ templateId, channel, subject: isEmail ? subject : null, body })
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2500)
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Failed to save.')
    }
    setSaving(false)
  }

  async function handleReset() {
    setResetting(true)
    setError('')
    const res = await fetch('/api/admin/templates/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, channel }),
    })
    if (res.ok) {
      const def = DEFAULT_TEMPLATES.find(t => t.templateId === templateId && t.channel === channel)!
      setSubject(def.subject ?? '')
      setBody(def.body)
      onSaved(def)
    } else {
      setError('Failed to reset.')
    }
    setResetting(false)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          {isEmail ? 'Email' : 'SMS'}
        </span>
        <div className="flex items-center gap-3">
          {savedFlash && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <Check size={12} /> Saved
            </span>
          )}
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors duration-200 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw size={11} />
            {resetting ? 'Resetting…' : 'Reset to default'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {isEmail && (
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#4A7C59]/40 focus:outline-none transition-colors duration-200"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Body</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={templateId === 'invoice' && isEmail ? 9 : 7}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 leading-relaxed focus:border-[#4A7C59]/40 focus:outline-none transition-colors duration-200 resize-none"
          />
          {templateId === 'invoice' && isEmail && !body.includes('{{lineItems}}') && (
            <p className="text-[11px] text-amber-600">
              This template is missing {'{{lineItems}}'} — the line-items table won&apos;t appear in the sent email without it.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Available: {tokens.map(t => `{{${t}}}`).join(', ')}
          </p>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="rounded-lg bg-[#4A7C59] px-4 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#3d6b4a] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  )
}

export default function TemplatesSettingsPage() {
  const [templates, setTemplates] = React.useState<MessageTemplate[]>(DEFAULT_TEMPLATES)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/admin/templates')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.templates) setTemplates(data.templates) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleSaved(updated: MessageTemplate) {
    setTemplates(prev => {
      const others = prev.filter(t => !(t.templateId === updated.templateId && t.channel === updated.channel))
      return [...others, updated]
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
        >
          <ChevronLeft size={16} />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Message Templates</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            These are the default Email and SMS copies used in the Contact panel on every job. Edits here apply immediately — they don&apos;t require a deploy.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading templates…</p>
      ) : (
        <div className="space-y-8">
          {TEMPLATE_ORDER.map(id => (
            <div key={id} className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">{TEMPLATE_LABELS[id]}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {CHANNELS_BY_TEMPLATE[id].map(channel => (
                  <ChannelEditor
                    key={channel}
                    templateId={id}
                    channel={channel}
                    template={findTemplate(templates, id, channel)}
                    onSaved={handleSaved}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
