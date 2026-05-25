'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowUpDown, ChevronLeft, Upload, Download, RefreshCw, CheckCircle, WifiOff } from 'lucide-react'
import { useFileTransfer } from '@/hooks/useFileTransfer'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function TransferPage() {
  const { role, roomCode, status, files, errorMsg, createRoom, joinRoom, sendFiles, reset } = useFileTransfer()

  const [codeInput, setCodeInput] = React.useState('')
  const [pendingFiles, setPendingFiles] = React.useState<File[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setPendingFiles(Array.from(e.target.files))
  }

  const handleSend = () => {
    if (pendingFiles.length > 0) sendFiles(pendingFiles)
  }

  const handleJoin = () => {
    const code = codeInput.trim()
    if (code.length === 4) joinRoom(code)
  }

  const isIdle = status === 'idle'
  const isWaiting = status === 'waiting'
  const isConnecting = status === 'connecting'
  const isConnected = status === 'connected'
  const isTransferring = status === 'transferring'
  const isDone = status === 'done'
  const isError = status === 'error'

  return (
    <div className="min-h-screen bg-slate-50 pb-safe">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex cursor-pointer items-center gap-1 text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-slate-900">
              <ChevronLeft size={16} />
              Admin
            </Link>
            <span className="text-slate-300">/</span>
            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={14} className="text-slate-400" />
              <p className="font-display text-lg font-semibold text-slate-900">File Transfer</p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-sm space-y-4">
          <p className="text-sm text-slate-500">
            Transfer videos and photos directly between your iPhone and Lenovo — no compression, no size limits. Both devices must be logged into admin.
          </p>

          <AnimatePresence mode="wait">
            {isIdle && (
              <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="space-y-3">
                <button onClick={createRoom} className="flex w-full cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 text-left transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1A3F6F]"><Upload size={16} className="text-white" /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Send from this device</p>
                    <p className="mt-0.5 text-xs text-slate-400">Photos · Videos · Any size</p>
                  </div>
                </button>

                <div className="space-y-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100"><Download size={16} className="text-slate-600" /></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Receive on this device</p>
                      <p className="mt-0.5 text-xs text-slate-400">Enter the 4-digit code from the sender</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      placeholder="0000"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && codeInput.length === 4) handleJoin()
                      }}
                      className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-2xl font-mono font-bold tracking-[0.3em] text-slate-900 placeholder:tracking-normal placeholder:text-slate-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A3F6F]"
                    />
                    <button onClick={handleJoin} disabled={codeInput.length !== 4} className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Join</button>
                  </div>
                </div>
              </motion.div>
            )}

            {isWaiting && role === 'sender' && (
              <motion.div key="waiting" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Room code</p>
                  <p className="text-xs text-slate-400">Enter this on your Lenovo at renewshine.co/admin/transfer</p>
                </div>
                <div className="flex justify-center gap-3">
                  {roomCode.split('').map((digit, i) => (
                    <div key={i} className="flex h-16 w-14 items-center justify-center rounded-xl bg-[#1A3F6F] font-mono text-3xl font-bold text-white shadow-sm">{digit}</div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2 py-1">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                  <p className="text-sm text-slate-500">Waiting for Lenovo to join…</p>
                </div>
                <p className="text-center text-xs text-slate-400">Keep your screen on during transfer</p>
                <button onClick={reset} className="w-full cursor-pointer text-xs text-slate-400 transition-colors duration-200 hover:text-slate-600">Cancel</button>
              </motion.div>
            )}

            {isConnecting && (
              <motion.div key="connecting" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="space-y-3 rounded-xl border border-slate-200 bg-white p-8 text-center">
                <div className="flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A3F6F] border-t-transparent" /></div>
                <p className="text-sm font-medium text-slate-700">Establishing connection…</p>
                <p className="text-xs text-slate-400">Usually takes 2–5 seconds</p>
              </motion.div>
            )}

            {isConnected && role === 'sender' && (
              <motion.div key="connected-sender" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5"><div className="h-2 w-2 rounded-full bg-emerald-500" /><p className="text-sm font-medium text-emerald-800">Connected — Lenovo is ready</p></div>
                <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
                <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-white px-5 py-8 text-slate-400 transition-colors duration-200 hover:border-[#1A3F6F] hover:bg-slate-50 hover:text-[#1A3F6F]">
                  <Upload size={28} />
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-700">{pendingFiles.length > 0 ? `${pendingFiles.length} file${pendingFiles.length > 1 ? 's' : ''} selected` : 'Tap to select photos or videos'}</p>
                    {pendingFiles.length > 0 && <p className="mt-1 text-xs text-slate-400">{formatBytes(pendingFiles.reduce((sum, f) => sum + f.size, 0))} total</p>}
                  </div>
                </button>

                {pendingFiles.length > 0 && (
                  <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {pendingFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                        <p className="truncate text-sm text-slate-800">{f.name}</p>
                        <p className="shrink-0 font-mono text-xs text-slate-400">{formatBytes(f.size)}</p>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={handleSend} disabled={pendingFiles.length === 0} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1A3F6F] px-5 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"><Upload size={15} />{pendingFiles.length > 0 ? `Send ${pendingFiles.length} file${pendingFiles.length > 1 ? 's' : ''}` : 'Select files to send'}</button>
              </motion.div>
            )}

            {isConnected && role === 'receiver' && (
              <motion.div key="connected-receiver" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="space-y-3 rounded-xl border border-slate-200 bg-white p-8 text-center">
                <div className="flex items-center justify-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500" /><p className="text-sm font-semibold text-emerald-800">Connected — waiting for files</p></div>
                <p className="text-xs text-slate-400">Files will download automatically as they arrive</p>
              </motion.div>
            )}

            {isTransferring && files.length > 0 && (
              <motion.div key="transferring" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {files.map((file) => (
                  <div key={file.id} className="space-y-2 px-4 py-3">
                    <div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-medium text-slate-900">{file.name}</p><p className="shrink-0 font-mono text-xs text-slate-500">{file.progress}%</p></div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#1A3F6F] transition-all duration-150" style={{ width: `${file.progress}%` }} /></div>
                    <p className="font-mono text-xs text-slate-400">{formatBytes(file.size)}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {isDone && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="space-y-3">
                <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"><CheckCircle size={32} className="mx-auto text-emerald-600" /><p className="text-base font-semibold text-emerald-900">Transfer complete</p><p className="text-sm text-emerald-700">{role === 'receiver' ? `${files.length} file${files.length !== 1 ? 's' : ''} saved to your downloads` : `${files.length} file${files.length !== 1 ? 's' : ''} sent successfully`}</p></div>
                <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 px-4 py-3"><CheckCircle size={14} className="shrink-0 text-emerald-500" /><p className="flex-1 truncate text-sm text-slate-800">{file.name}</p><p className="shrink-0 font-mono text-xs text-slate-400">{formatBytes(file.size)}</p></div>
                  ))}
                </div>
                <button onClick={reset} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"><RefreshCw size={14} />Transfer more files</button>
              </motion.div>
            )}

            {isError && (
              <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-center gap-2"><WifiOff size={16} className="shrink-0 text-red-500" /><p className="text-sm font-semibold text-red-800">Connection error</p></div>
                <p className="text-sm text-red-700">{errorMsg || 'Something went wrong. Please try again.'}</p>
                <button onClick={reset} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-red-600 transition-colors duration-200 hover:text-red-800"><RefreshCw size={14} />Try again</button>
              </motion.div>
            )}
          </AnimatePresence>

          {errorMsg && !isError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</p>}
        </div>
      </div>
    </div>
  )
}
