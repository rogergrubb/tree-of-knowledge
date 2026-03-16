'use client'

import { useState, useEffect, useCallback } from 'react'

interface TextToSpeechProps {
  text: string
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export default function TextToSpeech({ text, enabled, onToggle }: TextToSpeechProps) {
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(true)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSupported(false)
      return
    }

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()
      setVoices(availableVoices)
    }

    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      speechSynthesis.cancel()
    }
  }, [])

  const speak = useCallback(() => {
    if (!supported || !text) return

    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Try to find a pleasant English voice
    const preferredVoices = voices.filter(v => 
      v.lang.startsWith('en') && 
      (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    )
    
    if (preferredVoices.length > 0) {
      utterance.voice = preferredVoices[0]
    } else {
      const englishVoice = voices.find(v => v.lang.startsWith('en'))
      if (englishVoice) utterance.voice = englishVoice
    }

    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    speechSynthesis.speak(utterance)
  }, [text, voices, supported])

  const stop = useCallback(() => {
    speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  useEffect(() => {
    if (enabled && text) {
      speak()
    } else {
      stop()
    }
  }, [enabled, text, speak, stop])

  if (!supported) return null

  return (
    <button
      onClick={() => {
        if (speaking) {
          stop()
          onToggle(false)
        } else {
          onToggle(true)
        }
      }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        speaking
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
      }`}
      title={speaking ? 'Stop reading' : 'Read aloud'}
    >
      {speaking ? (
        <>
          <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
          <span className="text-sm">Stop</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
            />
          </svg>
          <span className="text-sm">Read Aloud</span>
        </>
      )}
    </button>
  )
}
