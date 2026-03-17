'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const AmbientMusic = dynamic(() => import('./AmbientMusic'), { ssr: false })

const STRIPE_LINK = 'https://buy.stripe.com/eVqaEZdeU15r1nE2mcaIM0U'

export default function SidebarButtons() {
  const [musicEnabled, setMusicEnabled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [supportExpanded, setSupportExpanded] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedMusic = localStorage.getItem('ambientMusicEnabled')
    if (savedMusic === 'true') {
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
      
      <div className="flex flex-col gap-2">
        {/* Support Button */}
        {supportExpanded ? (
          <div className="bg-[#12192b] border border-[#d4a853]/30 rounded-xl p-4">
            <button
              onClick={() => setSupportExpanded(false)}
              className="absolute top-2 right-3 text-white/20 hover:text-white/50 text-sm"
            >
              ×
            </button>
            <div className="text-center mb-3">
              <div className="text-xl mb-1">🌱</div>
              <p className="text-[11px] text-[#c0bab0] leading-relaxed">
                <strong className="text-[#f0ece4]">This is 100% free.</strong> No paywall. No account required.
              </p>
              <p className="text-[10px] text-white/25 mt-1.5 leading-relaxed">
                Every branch costs real AI tokens. Help the tree grow—
              </p>
            </div>
            <a
              href={STRIPE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2.5 rounded-lg font-bold text-[#0a0e18] text-[12px]
                bg-gradient-to-r from-[#d4a853] to-[#e8c56a] hover:from-[#e8c56a] hover:to-[#f0d888]
                transition-all"
            >
              💧 Water the Tree — $5
            </a>
            <button
              onClick={() => setSupportExpanded(false)}
              className="block w-full text-center text-[9px] text-white/20 hover:text-white/40 mt-2"
            >
              Maybe later
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSupportExpanded(true)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg
              bg-gradient-to-r from-[#d4a853]/10 to-[#d4a853]/5
              border border-[#d4a853]/20 hover:border-[#d4a853]/40
              text-[#f0d888] text-[12px] font-semibold
              transition-all"
          >
            <span>🌱</span>
            <span>Support the Tree</span>
          </button>
        )}

        {/* Music Button */}
        <button
          onClick={toggleMusic}
          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[12px] font-medium transition-all ${
            musicEnabled
              ? 'bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25'
              : 'bg-white/[0.03] text-white/40 border border-white/10 hover:bg-white/[0.06] hover:text-white/60'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
          <span>{musicEnabled ? 'Music On' : 'Music Off'}</span>
          {musicEnabled && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </button>
      </div>
    </>
  )
}
