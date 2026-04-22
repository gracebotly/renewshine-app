'use client'

import * as React from 'react'
import { useDropzone } from 'react-dropzone'
import { CheckCircle2, Loader2, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaUploadProps {
  // Encoded as "storagePath|contentType" — matches what create-job route expects
  onUpload: (encoded: string[]) => void
  uploadedEncoded: string[]
}

interface UploadItem {
  id: string
  name: string
  previewUrl: string       // blob: URL for display — never replaced
  storagePath: string      // returned by upload API — used in submit payload
  contentType: string
  isVideo: boolean
  uploading: boolean
  done: boolean
}

export function MediaUpload({ onUpload, uploadedEncoded }: MediaUploadProps) {
  const [error, setError] = React.useState('')
  const [items, setItems] = React.useState<UploadItem[]>([])

  const uploadFile = React.useCallback(
    async (file: File, id: string, previewUrl: string) => {
      const form = new FormData()
      form.append('file', file)
      try {
        const response = await fetch('/api/upload-media', { method: 'POST', body: form })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error ?? 'Upload failed')

        // data.path = storage path, data.contentType = mime type
        const encoded = `${data.path}|${data.contentType}`

        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? { ...i, storagePath: data.path, contentType: data.contentType, uploading: false, done: true }
              : i
          )
        )
        // Notify parent with encoded storage path — previewUrl stays in local state only
        onUpload([...uploadedEncoded, encoded])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed')
        setItems((prev) => prev.filter((i) => i.id !== id))
        URL.revokeObjectURL(previewUrl)
      }
    },
    [onUpload, uploadedEncoded]
  )

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      setError('')
      if (items.length + acceptedFiles.length > 10) {
        setError('You can upload up to 10 files total')
        return
      }
      acceptedFiles.forEach((file) => {
        const previewUrl = URL.createObjectURL(file)
        const id = crypto.randomUUID()
        const isVideo = file.type.startsWith('video/')
        setItems((prev) => [
          ...prev,
          {
            id,
            name: file.name,
            previewUrl,         // This is what the img/video tag reads — never overwritten
            storagePath: '',
            contentType: file.type,
            isVideo,
            uploading: true,
            done: false,
          },
        ])
        void uploadFile(file, id, previewUrl)
      })
    },
    [items.length, uploadFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 25 * 1024 * 1024,
    maxFiles: 10,
    accept: { 'image/*': [], 'video/*': [] },
    onDropRejected: (rejections) => {
      const code = rejections[0]?.errors[0]?.code
      if (code === 'file-too-large') setError('File too large (max 25MB)')
      else if (code === 'file-invalid-type') setError('Only images and videos are accepted')
      else setError('Upload failed. Please try again.')
    },
  })

  const handleRemove = (id: string, encoded: string) => {
    const item = items.find((i) => i.id === id)
    if (item) URL.revokeObjectURL(item.previewUrl)
    setItems((prev) => prev.filter((i) => i.id !== id))
    onUpload(uploadedEncoded.filter((e) => e !== encoded))
  }

  const doneCount = items.filter((i) => i.done).length
  const totalCount = items.length

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors duration-200',
          isDragActive
            ? 'border-(--color-brand) bg-(--color-brand-muted)/30'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        )}
      >
        <input {...getInputProps()} />
        <div
          className={cn(
            'mx-auto flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200',
            isDragActive ? 'bg-(--color-brand) text-white' : 'bg-slate-100 text-(--color-brand)'
          )}
        >
          <Upload size={22} />
        </div>
        <p className="mt-3 font-semibold text-slate-900">
          {isDragActive ? 'Drop files here' : 'Upload photos or a video'}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          A <span className="font-medium text-slate-900">60-second walkthrough video</span> gives us
          the most accurate picture. Photos of each room work too.
        </p>
        <p className="mt-3 text-xs text-slate-400">
          MP4 · MOV · JPG · PNG &nbsp;·&nbsp; Max 25MB per file &nbsp;·&nbsp; Up to 10 files
        </p>
      </div>

      {/* Error */}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {/* File count */}
      {totalCount > 0 ? (
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500">
            {doneCount === totalCount
              ? `${totalCount} file${totalCount !== 1 ? 's' : ''} uploaded`
              : `Uploading ${totalCount - doneCount} of ${totalCount}…`}
          </p>
          {doneCount === totalCount && totalCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
              <CheckCircle2 size={13} />
              All uploaded
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Thumbnail grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
            >
              {/* Thumbnail — always uses previewUrl (blob:) */}
              {item.isVideo ? (
                <video
                  src={item.previewUrl}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.previewUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              )}

              {/* Uploading overlay */}
              {item.uploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <Loader2 size={20} className="animate-spin text-(--color-brand)" />
                </div>
              ) : null}

              {/* Done badge */}
              {item.done ? (
                <div className="absolute bottom-1.5 left-1.5">
                  <CheckCircle2 size={16} className="text-emerald-500 drop-shadow" />
                </div>
              ) : null}

              {/* Remove button */}
              {!item.uploading ? (
                <button
                  type="button"
                  onClick={() =>
                    handleRemove(item.id, `${item.storagePath}|${item.contentType}`)
                  }
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-slate-900/70 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                  aria-label={`Remove ${item.name}`}
                >
                  <X size={12} />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
