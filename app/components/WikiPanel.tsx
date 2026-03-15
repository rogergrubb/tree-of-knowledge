"use client"
import { KnowledgeNode } from '../lib/ai'

interface WikiPanelProps {
  node: KnowledgeNode
  content: string | null
  loading: boolean
  isBookmarked: boolean
  onBookmark: () => void
  onDrillInto: (node: KnowledgeNode) => void
  onWikiLink: (term: string) => void
  onClose: () => void
  depth: number
  currentChildren: KnowledgeNode[]
}

function renderWikiContent(text: string, onLink: (term: string) => void) {
  // Replace [[term]] with clickable spans
  const parts = text.split(/\[\[(.*?)\]\]/)
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      // This is a linked term
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

export function WikiPanel({ node, content, loading, isBookmarked, onBookmark, onDrillInto, onWikiLink, onClose, depth, currentChildren }: WikiPanelProps) {
  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-[380px] z-20 pointer-events-auto">
      <div className="h-full bg-[#0c0c10]/90 backdrop-blur-2xl border-l border-white/5 flex flex-col relative">
        {/* Progress bar at very top of panel */}
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
              <button
                onClick={onBookmark}
                className={`text-sm p-1.5 rounded-md transition-all ${isBookmarked ? 'text-[#f0d888]' : 'text-white/25 hover:text-white/50'}`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark this topic'}
              >
                {isBookmarked ? '★' : '☆'}
              </button>
              <button
                onClick={onClose}
                className="text-white/25 hover:text-white/60 text-sm p-1.5 rounded-md transition-all"
              >
                ✕
              </button>
            </div>
          </div>
          {node.desc && (
            <p className="text-[12px] text-[#8a8880] leading-relaxed">{node.desc}</p>
          )}
          <div className="text-[9px] text-white/15 mt-2 tracking-wider uppercase font-semibold">
            Depth {depth} · {node.children?.length || '∞'} branches below
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-2xl mb-3 animate-pulse">📖</div>
              <div className="text-[12px] text-white/30">Generating article...</div>
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

          {/* Child branches as links */}
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
                      <span className="text-white/15 text-[10px] group-hover:text-white/30 transition-colors">→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No children = leaf node with infinite depth prompt */}
          {(!node.children || node.children.length === 0) && !loading && (
            <div className="mt-5 pt-4 border-t border-white/5 text-center">
              <div className="text-lg mb-2">🌱</div>
              <div className="text-[11px] text-white/30 mb-3">
                This branch hasn't grown yet. Click to let AI discover what lies deeper.
              </div>
              <button
                onClick={() => onDrillInto(node)}
                className="px-4 py-2 rounded-full bg-[#d4a853]/10 border border-[#d4a853]/20 text-[#d4a853] text-[11px] font-semibold hover:bg-[#d4a853]/20 transition-all"
              >
                🌱 Grow this branch
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
