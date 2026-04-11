'use client'

import * as React from 'react'
import { useDropzone } from 'react-dropzone'
import { Loader2, Upload, X } from 'lucide-react'

interface MediaUploadProps {
  onUpload: (urls: string[]) => void
  uploadedUrls: string[]
}

interface UploadItem {
  id: string
  name: string
  url: string
  isVideo: boolean
  uploading: boolean
}

export function MediaUpload({ onUpload, uploadedUrls }: MediaUploadProps) {
  const [error, setError] = React.useState('')
  const [items, setItems] = React.useState<UploadItem[]>([])

  React.useEffect(() => {
    setItems((prev) => {
      const existing = new Set(prev.map((p) => p.url))
      const next = [...prev]
      uploadedUrls.forEach((url) => {
        if (!existing.has(url)) {
          next.push({
            id: crypto.randomUUID(),
            name: url.split('/').pop() ?? 'uploaded-file',
            url,
            isVideo: /\.(mp4|mov|avi|webm)$/i.test(url),
            uploading: false,
          })
        }
      })
      return next
    })
  }, [uploadedUrls])

  const uploadFile = React.useCallback(
    async (file: File, id: string, previewUrl: string) => {
      const form = new FormData()
      form.append('file', file)
      try {
        const response = await fetch('/api/upload-media', { method: 'POST', body: form })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error ?? 'Upload failed')
        }

        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, url: data.url, uploading: false } : i)))
        const nextUrls = [...uploadedUrls, data.url]
        onUpload(nextUrls)
        if (previewUrl !== data.url) URL.revokeObjectURL(previewUrl)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed')
        setItems((prev) => prev.filter((i) => i.id !== id))
        URL.revokeObjectURL(previewUrl)
      }
    },
    [onUpload, uploadedUrls]
  )

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      setError('')
      if (items.length + acceptedFiles.length > 10) {
        setError('You can upload up to 10 files total')
        return
      }

      acceptedFiles.forEach((file) => {
        const preview = URL.createObjectURL(file)
        const id = crypto.randomUUID()
        const item: UploadItem = {
          id,
          name: file.name,
          url: preview,
          isVideo: file.type.startsWith('video/'),
          uploading: true,
        }
        setItems((prev) => [...prev, item])
        void uploadFile(file, id, preview)
      })
    },
    [items.length, uploadFile]
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 25 * 1024 * 1024,
    maxFiles: 10,
    accept: {
      'image/*': [],
      'video/*': [],
    },
    onDropRejected: (rejections) => {
      const first = rejections[0]
      if (!first) return
      const code = first.errors[0]?.code
      if (code === 'file-too-large') {
        setError('File too large (max 25MB)')
      } else if (code === 'file-invalid-type') {
        setError('Only images and videos are accepted')
      } else {
        setError('Upload failed. Please try again.')
      }
    },
  })

  const handleRemove = (url: string, id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    onUpload(uploadedUrls.filter((u) => u !== url))
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-xl border-2 border-dashed border-slate-200 p-8 text-center transition-colors duration-200 hover:border-slate-300"
      >
        <input {...getInputProps()} />
        <Upload size={24} className="mx-auto text-(--color-brand)" />
        <p className="mt-3 font-medium text-slate-900">Upload a video or photos <span className="text-slate-400 font-normal text-sm">(optional)</span></p>
        <p className="mt-1 text-sm text-slate-600">
          A <span className="font-medium text-slate-900">60-second walkthrough video</span> gives us the most accurate picture of your space. Photos of each room work too.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Skipping is fine — we&apos;ll follow up if we need more details before confirming your price.
        </p>
        <p className="mt-1 text-xs text-slate-400">MP4, MOV, JPG, PNG · Max 25MB per file · Up to 10 files</p>
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      {items.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="truncate text-xs text-slate-600">{item.name}</p>
                {item.uploading ? <Loader2 size={14} className="animate-spin text-(--color-brand)" /> : null}
              </div>
              <div className="overflow-hidden rounded-md border border-slate-200">
                {item.isVideo ? (
                  <video src={item.url} className="h-24 w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.name} className="h-24 w-full object-cover" />
                )}
              </div>
              {!item.uploading ? (
                <button
                  type="button"
                  onClick={() => handleRemove(item.url, item.id)}
                  className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs text-red-600 transition-colors duration-200 hover:text-red-700"
                >
                  <X size={12} /> Remove
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
