import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, Mic01Icon, ShipIcon } from '@hugeicons/core-free-icons'
import type { ChatResponse } from '@/lib/api'

interface VoiceChatOverlayProps {
  isOpen: boolean
  onExit: () => void
  onSubmit: (audio: Blob) => Promise<ChatResponse>
}

type VoiceStatus = 'listening' | 'processing' | 'speaking' | 'error'

export function VoiceChatOverlay({ isOpen, onExit, onSubmit }: VoiceChatOverlayProps) {
  const [status, setStatus] = useState<VoiceStatus>('listening')
  const [error, setError] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const finishingRef = useRef(false)
  const closingRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      recognitionRef.current?.stop()
      recorderRef.current?.stop()
      streamRef.current?.getTracks().forEach((track) => track.stop())
      audioRef.current?.pause()
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    closingRef.current = false
    setError(null)
    setStatus('listening')
    void beginListening()
  }, [isOpen])

  const finishRecording = () => {
    if (finishingRef.current) return
    finishingRef.current = true
    recognitionRef.current?.stop()
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
    }
  }

  async function beginListening() {
    if (!navigator.mediaDevices?.getUserMedia || !('MediaRecorder' in window)) {
      setError('Voice chat is not supported in this browser.')
      setStatus('error')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!mountedRef.current || !isOpen) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      streamRef.current = stream
      chunksRef.current = []
      finishingRef.current = false
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType })
      recorderRef.current = recorder
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        recorderRef.current = null
        const recording = new Blob(chunksRef.current, { type: mimeType })
        if (recording.size === 0 || !mountedRef.current || closingRef.current) return
        setStatus('processing')
        void submitRecording(recording)
      }
      recorder.start()

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.onend = finishRecording
        recognition.onerror = finishRecording
        recognitionRef.current = recognition
        recognition.start()
      }
    } catch {
      setError('Microphone access is required for voice chat.')
      setStatus('error')
    }
  }

  async function submitRecording(recording: Blob) {
    try {
      const response = await onSubmit(recording)
      if (!mountedRef.current || closingRef.current) return
      if (response.audio_base64) {
        setStatus('speaking')
        const audio = new Audio(response.audio_base64)
        audioRef.current = audio
        audio.onended = () => {
          if (mountedRef.current && !closingRef.current && isOpen) {
            setStatus('listening')
            void beginListening()
          }
        }
        await audio.play()
      } else {
        setStatus('listening')
        void beginListening()
      }
    } catch (submitError) {
      if (!mountedRef.current) return
      setError(submitError instanceof Error ? submitError.message : 'Unable to process your voice message.')
      setStatus('error')
    }
  }

  const handleExit = () => {
    closingRef.current = true
    recognitionRef.current?.stop()
    recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach((track) => track.stop())
    audioRef.current?.pause()
    onExit()
  }

  if (!isOpen) return null

  const isListening = status === 'listening'
  const statusLabel = status === 'speaking'
    ? 'ORCA is speaking'
    : status === 'processing'
      ? 'ORCA is preparing your advisory'
      : status === 'error'
        ? 'Voice chat unavailable'
        : 'Listening'

  return createPortal(
    <div className="fixed inset-0 z-120 flex min-h-dvh flex-col overflow-hidden bg-[#061a2c] text-white">
      <div className="flex items-center justify-between p-5 md:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-[#061a2c] shadow-lg shadow-cyan-400/20">
            <HugeiconsIcon icon={ShipIcon} size={22} />
          </div>
          <span className="text-lg font-semibold tracking-tight">ORCA voice</span>
        </div>
        <button
          type="button"
          onClick={handleExit}
          className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Exit voice chat"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
          Exit
        </button>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,211,238,0.14),transparent_38%)]" />
        <div className="relative flex flex-col items-center">
          {isListening ? (
            <button
              type="button"
              onClick={finishRecording}
              className="flex h-44 w-44 items-center justify-center rounded-full bg-cyan-400 text-[#061a2c] shadow-[0_0_0_18px_rgba(34,211,238,0.10),0_0_70px_rgba(34,211,238,0.30)] transition-transform hover:scale-105 active:scale-95 md:h-56 md:w-56"
              aria-label="Stop recording"
            >
              <HugeiconsIcon icon={Mic01Icon} size={72} strokeWidth={1.8} />
            </button>
          ) : (
            <div className="flex h-44 w-44 items-center justify-center rounded-full border border-cyan-300/30 bg-white/10 shadow-[0_0_70px_rgba(34,211,238,0.18)] md:h-56 md:w-56">
              <HugeiconsIcon icon={ShipIcon} size={92} className="text-cyan-300" />
            </div>
          )}
          <p className="mt-8 text-xl font-medium">{statusLabel}</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/55">
            {error || (isListening ? 'Speak naturally. ORCA will respond when you finish.' : 'Please wait a moment.')}
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}