'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

const CHUNK_SIZE = 65536

export type TransferFile = {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: 'queued' | 'transferring' | 'done' | 'error'
}

export type TransferRole = 'sender' | 'receiver' | null

export type TransferStatus =
  | 'idle'
  | 'waiting'
  | 'connecting'
  | 'connected'
  | 'transferring'
  | 'done'
  | 'error'

export function useFileTransfer() {
  const channelRef = useRef<ReturnType<typeof supabaseBrowser.channel> | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const receiveBufferRef = useRef<ArrayBuffer[]>([])
  const receiveMetaRef = useRef<{ id: string; name: string; size: number; type: string } | null>(null)
  const receivedSizeRef = useRef(0)

  const [role, setRole] = useState<TransferRole>(null)
  const [roomCode, setRoomCode] = useState('')
  const [status, setStatus] = useState<TransferStatus>('idle')
  const [files, setFiles] = useState<TransferFile[]>([])
  const [errorMsg, setErrorMsg] = useState('')

  const cleanup = useCallback(() => {
    dcRef.current?.close()
    pcRef.current?.close()
    channelRef.current?.unsubscribe()
    dcRef.current = null
    pcRef.current = null
    channelRef.current = null
    receiveBufferRef.current = []
    receiveMetaRef.current = null
    receivedSizeRef.current = 0
  }, [])

  useEffect(() => () => cleanup(), [cleanup])

  const buildPC = useCallback((isSender: boolean): RTCPeerConnection => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
    pcRef.current = pc

    pc.onicecandidate = (e) => {
      if (!e.candidate || !channelRef.current) return
      channelRef.current.send({
        type: 'broadcast',
        event: 'signal',
        payload: {
          type: 'ice',
          candidate: e.candidate,
          from: isSender ? 'sender' : 'receiver',
        },
      })
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') setStatus('connected')
      if (pc.connectionState === 'failed') {
        setStatus('error')
        setErrorMsg('Connection failed. Make sure both devices are on the same WiFi, or try again.')
      }
    }

    return pc
  }, [])

  const setupSenderDC = useCallback((dc: RTCDataChannel) => {
    dcRef.current = dc
    dc.binaryType = 'arraybuffer'
    dc.onopen = () => setStatus('connected')
    dc.onerror = () => {
      setStatus('error')
      setErrorMsg('Transfer channel error. Please try again.')
    }
  }, [])

  const setupReceiverDC = useCallback((dc: RTCDataChannel) => {
    dcRef.current = dc
    dc.binaryType = 'arraybuffer'
    dc.onopen = () => setStatus('connected')
    dc.onerror = () => {
      setStatus('error')
      setErrorMsg('Transfer channel error. Please try again.')
    }

    dc.onmessage = (event) => {
      if (typeof event.data === 'string') {
        const msg = JSON.parse(event.data) as {
          type: string; id?: string; name?: string; size?: number; mimeType?: string
        }

        if (msg.type === 'file-start') {
          receiveBufferRef.current = []
          receivedSizeRef.current = 0
          receiveMetaRef.current = {
            id: msg.id!,
            name: msg.name!,
            size: msg.size!,
            type: msg.mimeType ?? 'application/octet-stream',
          }
          setFiles((prev) => [...prev, { id: msg.id!, name: msg.name!, size: msg.size!, type: msg.mimeType ?? '', progress: 0, status: 'transferring' }])
          setStatus('transferring')
        }

        if (msg.type === 'file-end') {
          const meta = receiveMetaRef.current
          if (!meta) return

          const blob = new Blob(receiveBufferRef.current, { type: meta.type || 'application/octet-stream' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = meta.name
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          setTimeout(() => URL.revokeObjectURL(url), 30_000)

          setFiles((prev) => prev.map((f) => (f.id === meta.id ? { ...f, progress: 100, status: 'done' } : f)))
          receiveBufferRef.current = []
          receivedSizeRef.current = 0
          receiveMetaRef.current = null
        }

        if (msg.type === 'all-done') setStatus('done')
      } else {
        const chunk = event.data as ArrayBuffer
        receiveBufferRef.current.push(chunk)
        receivedSizeRef.current += chunk.byteLength
        const meta = receiveMetaRef.current
        if (meta) {
          const progress = Math.min(100, Math.round((receivedSizeRef.current / meta.size) * 100))
          setFiles((prev) => prev.map((f) => (f.id === meta.id ? { ...f, progress } : f)))
        }
      }
    }
  }, [])

  const createRoom = useCallback(async () => {
    cleanup()
    setErrorMsg('')
    setFiles([])

    const code = String(Math.floor(1000 + Math.random() * 9000))
    setRoomCode(code)
    setRole('sender')
    setStatus('waiting')

    const channel = supabaseBrowser.channel(`transfer:${code}`, { config: { broadcast: { self: false } } })
    channelRef.current = channel

    channel.on('broadcast', { event: 'signal' }, async ({ payload }: { payload: any }) => {
      if (!payload) return
      if (payload.type === 'join') {
        setStatus('connecting')
        const pc = buildPC(true)
        const dc = pc.createDataChannel('files', { ordered: true })
        setupSenderDC(dc)

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        channel.send({ type: 'broadcast', event: 'signal', payload: { type: 'offer', sdp: offer, from: 'sender' } })
      }

      if (payload.type === 'answer' && payload.from === 'receiver') {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(payload.sdp))
      }

      if (payload.type === 'ice' && payload.from === 'receiver') {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => {})
      }
    })

    await channel.subscribe()
  }, [cleanup, buildPC, setupSenderDC])

  const joinRoom = useCallback(async (code: string) => {
    cleanup()
    setErrorMsg('')
    setFiles([])
    setRoomCode(code)
    setRole('receiver')
    setStatus('connecting')

    const channel = supabaseBrowser.channel(`transfer:${code}`, { config: { broadcast: { self: false } } })
    channelRef.current = channel

    const pc = buildPC(false)
    pc.ondatachannel = (e) => setupReceiverDC(e.channel)

    channel.on('broadcast', { event: 'signal' }, async ({ payload }: { payload: any }) => {
      if (!payload) return

      if (payload.type === 'offer' && payload.from === 'sender') {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        channel.send({ type: 'broadcast', event: 'signal', payload: { type: 'answer', sdp: answer, from: 'receiver' } })
      }

      if (payload.type === 'ice' && payload.from === 'sender') {
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => {})
      }
    })

    await channel.subscribe()
    channel.send({ type: 'broadcast', event: 'signal', payload: { type: 'join', from: 'receiver' } })
  }, [cleanup, buildPC, setupReceiverDC])

  const sendFiles = useCallback(async (selectedFiles: File[]) => {
    const dc = dcRef.current
    if (!dc || dc.readyState !== 'open') {
      setErrorMsg('Not connected. Wait for a receiver to join first.')
      return
    }

    const fileList: TransferFile[] = selectedFiles.map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      type: f.type,
      progress: 0,
      status: 'queued',
    }))
    setFiles(fileList)
    setStatus('transferring')

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const meta = fileList[i]

      dc.send(JSON.stringify({ type: 'file-start', id: meta.id, name: file.name, size: file.size, mimeType: file.type }))

      const buffer = await file.arrayBuffer()
      let offset = 0

      while (offset < buffer.byteLength) {
        while (dc.bufferedAmount > CHUNK_SIZE * 8) {
          await new Promise<void>((resolve) => setTimeout(resolve, 16))
        }
        const chunk = buffer.slice(offset, offset + CHUNK_SIZE)
        dc.send(chunk)
        offset += chunk.byteLength

        const progress = Math.min(100, Math.round((offset / buffer.byteLength) * 100))
        setFiles((prev) => prev.map((f) => (f.id === meta.id ? { ...f, progress, status: 'transferring' } : f)))
      }

      dc.send(JSON.stringify({ type: 'file-end', id: meta.id }))
      setFiles((prev) => prev.map((f) => (f.id === meta.id ? { ...f, progress: 100, status: 'done' } : f)))
    }

    dc.send(JSON.stringify({ type: 'all-done' }))
    setStatus('done')
  }, [])

  const reset = useCallback(() => {
    cleanup()
    setRole(null)
    setRoomCode('')
    setStatus('idle')
    setFiles([])
    setErrorMsg('')
  }, [cleanup])

  return { role, roomCode, status, files, errorMsg, createRoom, joinRoom, sendFiles, reset }
}
