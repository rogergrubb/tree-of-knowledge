"use client"
import { UserProgress } from '../lib/ai'

interface SidebarProps {
  progress: UserProgress
  exploredNodes: Set<string>
  bookmarks: string[]
  deepestLevel: number
  totalNodes: number
  onClose: () => void
  onNavigateBookmark: (name: string) => void
}

export function Sidebar({ progress, exploredNodes, bookmarks, deepestLevel, totalNodes, onClose, onNavigateBookmark }: SidebarProps) {
  const levelTitles = ['Sapling', 'Seedling', 'Sprout', 'Young Tree', 'Growing Oak', 'Mighty Redwood', 'Ancient Sequoia', 'World Tree', 'Yggdrasil', 'Omniscient']
  const levelIndex = Math.min(Math.floor(exploredNodes.size / 10), levelTitles.length - 1)

  return (
    <div className="fixed inset-0 z-30 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-[320px] h-full bg-[#0a0a0e]/95 backdrop-blur-2xl border-r border-white/5 flex flex-col pointer-events-auto overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[#f0ece4] text-base" style={{ fontFamily: "'Lora', serif" }}>
              Your Journey
            </h2>
            <button onClick={onClose} className="text-white/25 hover:text-white/60 text-sm">✕</button>
          </div>

          {/* Level Badge */}
          <div className="bg-gradient-to-r from-[#d4a853]/10 to-transparent rounded-xl p-3 border border-[#d4a853]/10">
            <div className="text-[10px] text-[#d4a853]/50 uppercase tracking-wider font-bold">Explorer Level</div>
            <div className="text-[#f0d888] font-bold text-lg mt-0.5" style={{ fontFamily: "'Lora', serif" }}>
              🌳 {levelTitles[levelIndex]}
            </div>
            <div className="text-[10px] text-white/20 mt-1">
              {exploredNodes.size} nodes explored · Depth {deepestLevel}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-5 border-b border-white/5">
          <div className="text-[9px] text-white/20 uppercase tracking-wider font-bold mb-3">Statistics</div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Nodes Explored', value: exploredNodes.size.toString(), icon: '🗺' },
              { label: 'Deepest Level', value: deepestLevel.toString(), icon: '🏔' },
              { label: 'Sessions', value: progress.sessions.toString(), icon: '📅' },
              { label: 'Tree Size', value: `${totalNodes}+`, icon: '🌳' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.03]">
                <div className="text-lg mb-1">{stat.icon}</div>
                <div className="text-[14px] font-bold text-[#f0ece4]">{stat.value}</div>
                <div className="text-[9px] text-white/25 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Depth Progress */}
        <div className="p-5 border-b border-white/5">
          <div className="text-[9px] text-white/20 uppercase tracking-wider font-bold mb-3">How Deep Can You Go?</div>
          <div className="space-y-1.5">
            {['Canopy', 'Branch', 'Limb', 'Twig', 'Leaf', 'Vein', 'Cell', 'Molecule', 'Atom', 'Quark'].map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold border
                  ${i <= deepestLevel
                    ? 'bg-[#d4a853]/15 border-[#d4a853]/30 text-[#f0d888]'
                    : 'bg-white/[0.02] border-white/[0.04] text-white/15'
                  }`}>
                  {i + 1}
                </div>
                <span className={`text-[11px] font-medium ${i <= deepestLevel ? 'text-[#f0ece4]' : 'text-white/15'}`}>
                  {name}
                </span>
                {i === deepestLevel && <span className="text-[8px] text-[#d4a853] ml-auto">← YOU</span>}
              </div>
            ))}
          </div>
          <div className="text-[9px] text-white/10 mt-3 text-center italic">
            Knowledge is infinite. How deep will you explore?
          </div>
        </div>

        {/* Bookmarks */}
        <div className="p-5">
          <div className="text-[9px] text-white/20 uppercase tracking-wider font-bold mb-3">
            ★ Bookmarks ({bookmarks.length})
          </div>
          {bookmarks.length === 0 ? (
            <div className="text-[11px] text-white/15 text-center py-4">
              No bookmarks yet. Star topics you want to revisit.
            </div>
          ) : (
            <div className="space-y-1">
              {bookmarks.map((name, i) => (
                <button
                  key={i}
                  onClick={() => onNavigateBookmark(name)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] text-[11px] text-[#c0bab0] hover:text-[#f0d888] transition-all border border-white/[0.02]"
                >
                  ★ {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
