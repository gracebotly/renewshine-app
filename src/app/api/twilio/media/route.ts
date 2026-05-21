import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mediaUrl = searchParams.get('url')

  if (!mediaUrl) {
    return new NextResponse('Missing url param', { status: 400 })
  }

  if (!mediaUrl.startsWith('https://api.twilio.com/')) {
    return new NextResponse('Only Twilio media URLs are supported', { status: 400 })
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    return new NextResponse('Twilio credentials are not configured', { status: 500 })
  }

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

  const response = await fetch(mediaUrl, {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    return new NextResponse('Failed to fetch media', { status: response.status })
  }

  const contentType = response.headers.get('content-type') ?? 'application/octet-stream'
  const buffer = await response.arrayBuffer()

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
