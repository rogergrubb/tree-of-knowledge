'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const AmbientMusic = dynamic(() => import('./AmbientMusic'), { ssr: false })

export default function AudioControls() {
  const [musicEnabled, setMusicEnabled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('ambientMusicEnabled')
    if (saved === 'true') {
      setMusicEnabled(true)
    }
  }, [])

  const toggleMusic = () => {
    const newState = !musicEnabled
    setMusicEnabled(newState)
    localStorage.setItem('ambientMusicEnabled', String(newState))
  }

  if (!mounted) return null

  return (
    <>
      <AmbientMusic enabled={musicEnabled} />
      
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleMusic}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all backdrop-blur-sm ${
            musicEnabled
              ? 'bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30'
              : 'bg-gray-900/80 text-gray-400 border border-gray-700 hover:bg-gray-800/80 hover:text-white'
          }`}
          title={musicEnabled ? 'Turn off ambient music' : 'Turn on ambient music'}
        >
          {musicEnabled ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              <span className="text-sm font-medium">Music On</span>
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              <span className="text-sm font-medium">Music Off</span>
            </>
          )}
        </button>
      </div>
    </>
  )
}
