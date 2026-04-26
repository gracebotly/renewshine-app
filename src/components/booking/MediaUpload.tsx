'use client'

import * as React from 'react'
import { useDropzone } from 'react-dropzone'
import { CheckCircle2, Film, Loader2, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabaseBrowser } from '@/lib/supabase/client'

interface MediaUploadProps {
  onUpload: (encoded: string[]) => void
  uploadedEncoded: string[]
}

interface UploadItem {
  id: string
  name: string
  previewUrl: string
  storagePath: string
  contentType: string
  isVideo: boolean
  uploading: boolean
  done: boolean
}

export function MediaUpload({ onUpload, uploadedEncoded }: MediaUploadProps) {
  const [error, setError] = React.useState('')
  const [items, setItems] = React.useState<UploadItem[]>([])

  // Ref-based accumulator prevents race condition when multiple files
  // upload concurrently — each appends to ref instead of reading stale closure
  const encodedRef = React.useRef<string[]>([])
  React.useEffect(() => {
    encodedRef.current = uploadedEncoded
  }, [uploadedEncoded])

  const uploadFile = React.useCallback(
    async (file: File, id: string, previewUrl: string, resolvedContentType: string) => {
      try {
        // Generate a random storage path — same pattern as the old server route
        const ext = file.name.split('.').pop()?.toLowerCase() ||
          (resolvedContentType === 'image/heic' ? 'heic' :
           resolvedContentType === 'image/heif' ? 'heif' :
           resolvedContentType === 'video/quicktime' ? 'mov' : 'bin')
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        // Upload directly from browser to Supabase Storage.
        // Bypasses Vercel entirely — no 4.5MB route handler limit.
        const uploadFile = resolvedContentType !== file.type
          ? new File([file], file.name, { type: resolvedContentType })
          : file

        const { data, error: uploadError } = await supabaseBrowser.storage
          .from('job-media')
          .upload(path, uploadFile, {
            contentType: resolvedContentType,
            upsert: false,
          })

        if (uploadError || !data) {
          throw new Error(uploadError?.message ?? 'Upload failed')
        }

        const encoded = `${data.path}|${resolvedContentType}`
        encodedRef.current = [...encodedRef.current, encoded]
        onUpload(encodedRef.current)

        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? { ...i, storagePath: data.path, uploading: false, done: true }
              : i
          )
        )
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Upload failed'
        setError(msg)
        setItems((prev) => prev.filter((i) => i.id !== id))
        URL.revokeObjectURL(previewUrl)
      }
    },
    [onUpload]
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
        // Resolve content type — handles HEIC/HEIF and empty browser-reported types
        const contentType =
          file.type ||
          (file.name.toLowerCase().endsWith('.heic') ? 'image/heic' :
           file.name.toLowerCase().endsWith('.heif') ? 'image/heif' :
           file.name.toLowerCase().endsWith('.mov') ? 'video/quicktime' :
           'application/octet-stream')

        setItems((prev) => [
          ...prev,
          {
            id,
            name: file.name,
            previewUrl,
            storagePath: '',
            contentType,
            isVideo,
            uploading: true,
            done: false,
          },
        ])
        void uploadFile(file, id, previewUrl, contentType)
      })
    },
    [items.length, uploadFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxFiles: 10,
    // No maxSize — Supabase handles limits, Vercel no longer in the path
    accept: {
      'image/*': [],
      'image/heic': ['.heic'],
      'image/heif': ['.heif'],
      'video/*': [],
      'video/quicktime': ['.mov'],
    },
    onDropRejected: (rejections) => {
      const code = rejections[0]?.errors[0]?.code
      if (code === 'file-invalid-type') setError('Only photos and videos are accepted')
      else if (code === 'too-many-files') setError('Maximum 10 files')
      else setError('Upload failed. Please try again.')
    },
  })

  const handleRemove = (id: string, encoded: string) => {
    const item = items.find((i) => i.id === id)
    if (item) URL.revokeObjectURL(item.previewUrl)
    setItems((prev) => prev.filter((i) => i.id !== id))
    const next = uploadedEncoded.filter((e) => e !== encoded)
    encodedRef.current = next
    onUpload(next)
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
        <div className={cn(
          'mx-auto flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200',
          isDragActive ? 'bg-(--color-brand) text-white' : 'bg-slate-100 text-(--color-brand)'
        )}>
          <Upload size={22} />
        </div>
        <p className="mt-3 font-semibold text-slate-900">
          {isDragActive ? 'Drop files here' : 'Upload photos or a video'}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          A <span className="font-medium text-slate-900">60-second walkthrough video</span> gives
          us the most accurate picture. Photos of each room work too.
        </p>
        <p className="mt-3 text-xs text-slate-400">
          MP4 · MOV · HEIC · JPG · PNG &nbsp;·&nbsp; Up to 10 files
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
              : `Uploading… (${doneCount} of ${totalCount} done)`}
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
              {item.isVideo ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-slate-800">
                  <Film size={22} className="text-slate-300" />
                  <span className="max-w-full truncate px-1 text-center text-[10px] leading-tight text-slate-400">
                    {item.name}
                  </span>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.previewUrl} alt={item.name} className="h-full w-full object-cover" />
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
                  onClick={() => handleRemove(item.id, `${item.storagePath}|${item.contentType}`)}
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
