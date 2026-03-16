'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import AmbientMusic to avoid SSR issues with Tone.js
const AmbientMusic = dynamic(() => import('./AmbientMusic'), { ssr: false })

interface AudioControlsProps {
  showTTS?: boolean
  ttsText?: string
}

export default function AudioControls({ showTTS = false, ttsText = '' }: AudioControlsProps) {
  const [musicEnabled, setMusicEnabled] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [ttsSpeaking, setTtsSpeaking] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Don't auto-start music from localStorage — requires user click (browser policy)
  }, [])

  const toggleMusic = async () => {
    const newState = !musicEnabled
    setMusicEnabled(newState)
    localStorage.setItem('ambientMusicEnabled', String(newState))
  }

  const toggleTTS = () => {
    if (ttsSpeaking) {
      speechSynthesis.cancel()
      setTtsSpeaking(false)
      setTtsEnabled(false)
    } else {
      setTtsEnabled(true)
      speakText(ttsText)
    }
  }

  const speakText = (text: string) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return

    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const voices = speechSynthesis.getVoices()
    
    // Find a nice English voice
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural'))
    ) || voices.find(v => v.lang.startsWith('en'))
    
    if (preferredVoice) utterance.voice = preferredVoice

    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.volume = 0.85

    utterance.onstart = () => setTtsSpeaking(true)
    utterance.onend = () => {
      setTtsSpeaking(false)
      setTtsEnabled(false)
    }
    utterance.onerror = () => {
      setTtsSpeaking(false)
      setTtsEnabled(false)
    }

    speechSynthesis.speak(utterance)
  }

  if (!mounted) return null

  return (
    <>
      <AmbientMusic enabled={musicEnabled} />
      
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {/* Music Toggle */}
        <button
          onClick={toggleMusic}
          className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all ${
            musicEnabled
              ? 'bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30'
              : 'bg-gray-800/80 text-gray-400 border border-gray-700 hover:bg-gray-700/80 hover:text-white'
          }`}
          title={musicEnabled ? 'Turn off ambient music' : 'Turn on ambient music'}
        >
          {musicEnabled ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              <span className="text-sm font-medium">Music On</span>
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" opacity="0.5"/>
              </svg>
              <span className="text-sm font-medium">Music Off</span>
            </>
          )}
        </button>

        {/* TTS Toggle - only show when applicable */}
        {showTTS && ttsText && (
          <button
            onClick={toggleTTS}
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all ${
              ttsSpeaking
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 hover:bg-blue-500/30'
                : 'bg-gray-800/80 text-gray-400 border border-gray-700 hover:bg-gray-700/80 hover:text-white'
            }`}
            title={ttsSpeaking ? 'Stop reading' : 'Read page aloud'}
          >
            {ttsSpeaking ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z"/>
                </svg>
                <span className="text-sm font-medium">Stop Reading</span>
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
                  />
                </svg>
                <span className="text-sm font-medium">Read Aloud</span>
              </>
            )}
          </button>
        )}
      </div>
    </>
  )
}
