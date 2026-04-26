import { createClient } from '@supabase/supabase-js'
import { rateLimit, getClientIp } from '@/lib/ratelimit'

// IMPORTANT: The 'job-media' bucket must be set to PRIVATE in Supabase Dashboard.
// Dashboard → Storage → job-media → Edit bucket → toggle "Public bucket" OFF.
// This endpoint no longer returns public URLs — it returns a storage path.
// The admin job detail page generates short-lived signed URLs at view time.

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Rate limit: max 10 uploads per IP per 10 minutes
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 10 * 60 * 1000

export async function POST(request: Request) {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ip = getClientIp(request)
  if (!rateLimit(`upload:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return Response.json(
      { error: 'Too many uploads. Please wait a few minutes and try again.' },
      { status: 429 }
    )
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  // ── File type validation ───────────────────────────────────────────────────
  const ALLOWED_IMAGE_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'image/heic', 'image/heif', // iPhone camera formats
  ]
  const ALLOWED_VIDEO_TYPES = [
    'video/mp4', 'video/mov', 'video/quicktime', 'video/avi', 'video/webm',
  ]

  const isImage = file.type.startsWith('image/') || ALLOWED_IMAGE_TYPES.includes(file.type)
  const isVideo = file.type.startsWith('video/') || ALLOWED_VIDEO_TYPES.includes(file.type)

  if (!isImage && !isVideo) {
    console.error('Rejected file type:', file.type, 'name:', file.name)
    return Response.json({ error: 'Only images and videos are accepted' }, { status: 400 })
  }

  // ── File size limit: 25MB ──────────────────────────────────────────────────
  if (file.size > 25 * 1024 * 1024) {
    return Response.json({ error: 'File too large (max 25MB)' }, { status: 400 })
  }

  // ── Generate a random storage path ────────────────────────────────────────
  // HEIC files from iPhone sometimes arrive with generic names like 'image.bin'
  // Fall back to extension derived from MIME type when filename extension is missing/generic
  const nameExt = file.name.split('.').pop()?.toLowerCase() ?? ''
  const mimeExt = file.type === 'image/heic' ? 'heic'
    : file.type === 'image/heif' ? 'heif'
    : file.type === 'video/quicktime' ? 'mov'
    : ''
  const ext = (nameExt && nameExt !== 'bin') ? nameExt : (mimeExt || 'bin')
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // ── Upload to private bucket ───────────────────────────────────────────────
  const { data, error } = await supabase.storage.from('job-media').upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  })

  if (error || !data) {
    console.error('Storage upload error:', error)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }

  // Return the storage path and content type.
  // The admin generates a signed URL from path at view time.
  // contentType is passed through so callers don't have to guess from extension.
  return Response.json({ path: data.path, contentType: file.type }, { status: 201 })
}
