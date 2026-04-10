import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')
  if (!isImage && !isVideo) {
    return Response.json({ error: 'Only images and videos are accepted' }, { status: 400 })
  }

  if (file.size > 25 * 1024 * 1024) {
    return Response.json({ error: 'File too large (max 25MB)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { data, error } = await supabase.storage.from('job-media').upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  })

  if (error || !data) {
    console.error('Storage upload error:', error)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('job-media').getPublicUrl(data.path)

  return Response.json({ url: publicUrl }, { status: 201 })
}
