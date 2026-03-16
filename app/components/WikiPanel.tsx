"use client"
import { useState, useEffect, useCallback } from 'react'
import { KnowledgeNode } from '../lib/ai'

interface WikiPanelProps {
  node: KnowledgeNode
  content: string | null
  loading: boolean
  isBookmarked: boolean
  isGenerating: boolean
  onBookmark: () => void
  onDrillInto: (node: KnowledgeNode) => void
  onWikiLink: (term: string) => void
  onClose: () => void
  depth: number
  currentChildren: KnowledgeNode[]
}

function renderWikiContent(text: string, onLink: (term: string) => void) {
  const parts = text.split(/\[\[(.*?)\]\]/)
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <button
          key={i}
          onClick={() => onLink(part)}
          className="text-[#d4a853] hover:text-[#f0d888] underline decoration-[#d4a853]/30 hover:decoration-[#f0d888]/50 underline-offset-2 transition-colors font-medium cursor-pointer"
        >
          {part}
        </button>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function stripWikiMarkup(text: string): string {
  return text.replace(/\[\[(.*?)\]\]/g, '$1')
}

// SVG Icons as components
const SpeakerIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
    />
  </svg>
)

const StopIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <rect x="6" y="6" width="12" height="12" rx="1"/>
  </svg>
)

const StarFilledIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

const StarOutlineIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
  </svg>
)

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
  </svg>
)

const ArrowIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
  </svg>
)

export function WikiPanel({ node, content, loading, isBookmarked, isGenerating, onBookmark, onDrillInto, onWikiLink, onClose, depth, currentChildren }: WikiPanelProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [ttsSupported, setTtsSupported] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setTtsSupported(false)
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [content, node])

  const toggleSpeech = useCallback(() => {
    if (!content) return

    if (isSpeaking) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const textToSpeak = `${node.name}. ${node.desc || ''}. ${stripWikiMarkup(content)}`
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    
    const voices = speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural') || v.name.includes('Daniel'))
    ) || voices.find(v => v.lang.startsWith('en'))
    
    if (preferredVoice) utterance.voice = preferredVoice

    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.volume = 0.85

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    speechSynthesis.speak(utterance)
  }, [content, node, isSpeaking])

  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-[380px] z-20 pointer-events-auto">
      <div className="h-full bg-[#0c0c10]/90 backdrop-blur-2xl border-l border-white/5 flex flex-col relative">
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-[3px] z-30 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-[#d4a853] to-transparent animate-shimmer" 
                 style={{ 
                   width: '40%',
                   animation: 'shimmer 1.2s ease-in-out infinite'
                 }} />
            <style>{`
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(350%); }
              }
            `}</style>
          </div>
        )}
        
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {node.icon && <span className="text-xl">{node.icon}</span>}
              <h2 className="font-bold text-[#f0ece4] text-base" style={{ fontFamily: "'Lora', serif" }}>
                {node.name}
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              {/* TTS Button */}
              {ttsSupported && content && (
                <button
                  onClick={toggleSpeech}
                  className={`text-sm p-1.5 rounded-md transition-all ${
                    isSpeaking 
                      ? 'text-blue-400 bg-blue-500/20' 
                      : 'text-white/25 hover:text-white/50 hover:bg-white/5'
                  }`}
                  title={isSpeaking ? 'Stop reading' : 'Read aloud'}
                >
                  {isSpeaking ? <StopIcon /> : <SpeakerIcon />}
                </button>
              )}
              {/* Bookmark Button */}
              <button
                onClick={onBookmark}
                className={`text-sm p-1.5 rounded-md transition-all ${isBookmarked ? 'text-[#f0d888]' : 'text-white/25 hover:text-white/50'}`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark this topic'}
              >
                {isBookmarked ? <StarFilledIcon /> : <StarOutlineIcon />}
              </button>
              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-white/25 hover:text-white/60 text-sm p-1.5 rounded-md transition-all"
                title="Close panel"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
          {node.desc && (
            <p className="text-[12px] text-[#8a8880] leading-relaxed">{node.desc}</p>
          )}
          <div className="text-[9px] text-white/15 mt-2 tracking-wider uppercase font-semibold">
            Depth {depth} &middot; {node.children?.length || 0} branches below
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-16 h-16 mb-4">
                <svg className="w-16 h-16 animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(212,168,83,0.12)" strokeWidth="2" />
                  <path d="M32 4 a28 28 0 0 1 28 28" fill="none" stroke="#d4a853" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <svg className="absolute inset-0 w-16 h-16 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="18" fill="none" stroke="rgba(212,168,83,0.08)" strokeWidth="1.5" />
                  <path d="M32 14 a18 18 0 0 1 18 18" fill="none" stroke="rgba(240,216,136,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#d4a853]/40 animate-pulse" />
                </div>
              </div>
              <div className="text-[12px] text-white/30 font-medium">Exploring this topic...</div>
              <div className="text-[10px] text-white/15 mt-1">AI is writing an article</div>
            </div>
          ) : content ? (
            <div className="text-[13px] text-[#c0bab0] leading-[1.7] space-y-3">
              {content.split('\n\n').map((para, i) => (
                <p key={i}>{renderWikiContent(para, onWikiLink)}</p>
              ))}
            </div>
          ) : (
            <div className="text-[12px] text-white/20 text-center py-6">
              Click to explore this topic further
            </div>
          )}

          {/* Child branches */}
          {node.children && node.children.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/5">
              <div className="text-[9px] text-white/20 uppercase tracking-wider font-bold mb-2.5">
                Branches
              </div>
              <div className="space-y-1.5">
                {node.children.map((child, i) => (
                  <button
                    key={i}
                    onClick={() => onDrillInto(child)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] hover:border-white/[0.06] transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[12px] text-[#e0dcd4] font-medium group-hover:text-[#f0d888] transition-colors">
                          {child.icon} {child.name}
                        </span>
                        {child.desc && (
                          <div className="text-[10px] text-white/25 mt-0.5 line-clamp-1">{child.desc}</div>
                        )}
                      </div>
                      <span className="text-white/15 group-hover:text-white/30 transition-colors">
                        <ArrowIcon />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Leaf node - grow prompt */}
          {(!node.children || node.children.length === 0) && !loading && (
            <div className="mt-5 pt-4 border-t border-white/5 text-center">
              {isGenerating ? (
                <>
                  <div className="relative w-14 h-14 mx-auto mb-3">
                    <svg className="w-14 h-14 animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(212,168,83,0.12)" strokeWidth="2" />
                      <path d="M28 4 a24 24 0 0 1 24 24" fill="none" stroke="#d4a853" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <svg className="absolute inset-0 w-14 h-14 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="15" fill="none" stroke="rgba(212,168,83,0.08)" strokeWidth="1.5" />
                      <path d="M28 13 a15 15 0 0 1 15 15" fill="none" stroke="rgba(240,216,136,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg">&#127793;</span>
                    </div>
                  </div>
                  <div className="text-[12px] text-white/30 font-medium">Growing new branches...</div>
                  <div className="text-[10px] text-white/15 mt-1">AI is discovering subtopics</div>
                </>
              ) : (
                <>
                  <div className="text-lg mb-2">&#127793;</div>
                  <div className="text-[11px] text-white/30 mb-3">
                    This branch hasn&apos;t grown yet. Click to let AI discover what lies deeper.
                  </div>
                  <button
                    onClick={() => onDrillInto(node)}
                    className="px-4 py-2 rounded-full bg-[#d4a853]/10 border border-[#d4a853]/20 text-[#d4a853] text-[11px] font-semibold hover:bg-[#d4a853]/20 transition-all"
                  >
                    &#127807; Grow this branch
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
