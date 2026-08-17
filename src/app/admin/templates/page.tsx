'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronLeft, Check, RotateCcw } from 'lucide-react'
import { BlockEditor } from '@/components/admin/BlockEditor'
import { DEFAULT_DOCUMENTS } from '@/lib/documents/defaults'
import {
  MESSAGE_KEYS,
  MESSAGE_LABELS,
  documentKey,
} from '@/lib/documents/types'
import type {
  DocumentChannel,
  MessageDocument,
  MessageKey,
} from '@/lib/documents/types'

function cloneDocument(doc: MessageDocument): MessageDocument {
  return JSON.parse(JSON.stringify(doc)) as MessageDocument
}

export default function TemplatesSettingsPage() {
  const [documents, setDocuments] = React.useState<
    Record<string, MessageDocument>
  >({})
  const [key, setKey] = React.useState<MessageKey>('photos')
  const [channel, setChannel] = React.useState<DocumentChannel>('email')
  const [doc, setDoc] = React.useState<MessageDocument | null>(null)
  const [sampleJobId, setSampleJobId] = React.useState<string | null>(null)
  const [previewHtml, setPreviewHtml] = React.useState('')
  const [previewText, setPreviewText] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    // The preview needs a real job for context. Any recent one works — this is a
    // sample render, not a send. With no jobs, show the editor without a preview.
    fetch('/api/admin/documents')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.documents) setDocuments(data.documents)
        setSampleJobId(data?.sampleJobId ?? null)
      })
      .catch(() => setError('Failed to load documents.'))
  }, [])

  const dk = documentKey(key, channel)
  React.useEffect(() => {
    const source = documents[dk] ?? DEFAULT_DOCUMENTS[dk]
    setDoc(source ? cloneDocument(source) : null)
  }, [dk, documents])

  React.useEffect(() => {
    if (!doc || !sampleJobId) {
      setPreviewHtml('')
      setPreviewText('')
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/admin/preview-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: sampleJobId, document: doc }),
        })
        const data = await res.json()
        setPreviewHtml(data.html ?? '')
        setPreviewText(data.text ?? '')
      } catch {
        setPreviewHtml('')
        setPreviewText('')
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [doc, sampleJobId])

  async function handleSave() {
    if (!doc) return
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, channel, document: doc }),
    }).catch(() => null)
    if (res?.ok) {
      setDocuments((prev) => ({ ...prev, [dk]: cloneDocument(doc) }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else setError('Failed to save document.')
    setSaving(false)
  }

  function handleReset() {
    const builtIn = DEFAULT_DOCUMENTS[dk]
    if (builtIn) setDoc(cloneDocument(builtIn))
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
        >
          <ChevronLeft size={16} />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Message Templates
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Edit the default email and SMS documents used for future jobs.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {MESSAGE_KEYS.map((messageKey) => (
          <button
            key={messageKey}
            onClick={() => setKey(messageKey)}
            className={`rounded-lg border px-3 py-2 text-xs font-medium cursor-pointer transition-colors duration-200 ${key === messageKey ? 'border-[#4A7C59] bg-[#e8f3ec] text-[#3d6b4a]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            {MESSAGE_LABELS[messageKey]}
          </button>
        ))}
      </div>

      <div className="flex overflow-hidden rounded-lg border border-slate-200 max-w-xs">
        {(['email', 'sms'] as const).map((ch) => (
          <button
            key={ch}
            onClick={() => setChannel(ch)}
            className={`flex-1 py-2.5 text-xs font-semibold cursor-pointer transition-colors duration-200 ${channel === ch ? 'bg-[#4A7C59] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            {ch === 'email' ? 'Email' : 'SMS'}
          </button>
        ))}
      </div>

      {doc && (
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="space-y-3">
            <BlockEditor document={doc} onChange={setDoc} />
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer transition-colors duration-200"
              >
                <RotateCcw size={13} /> Reset to built-in
              </button>
              <div className="flex items-center gap-3">
                {saved && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                    <Check size={13} /> Saved
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-[#4A7C59] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3d6b4a] cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
          <div className="min-h-64 rounded-xl border border-slate-200 bg-slate-50 p-3">
            {!sampleJobId ? (
              <p className="text-sm text-slate-500">
                Add a job to enable sample previews.
              </p>
            ) : doc.channel === 'email' && previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                className="h-[680px] w-full rounded-lg bg-white"
                title="Document preview"
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="rounded-lg bg-white p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900">
                  {previewText || 'Generating preview…'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
