"use client"
interface DepthChallengeProps {
  depth: number
  nodesExplored: number
  onClose: () => void
  onKeepGoing: () => void
}

const MILESTONES: Record<number, { title: string; emoji: string; message: string }> = {
  4: { title: 'Branch Explorer', emoji: '🌿', message: "You've reached the 4th level of depth! Most people stop at the main branches. You're already exploring the twigs." },
  7: { title: 'Deep Diver', emoji: '🏊', message: "Level 7! You're now deeper than 90% of explorers. The knowledge here is specialized and fascinating." },
  10: { title: 'Root Seeker', emoji: '🔬', message: "Incredible — Level 10! You're approaching research-grade depth. The boundaries of known knowledge are just ahead." }
}

export function DepthChallenge({ depth, nodesExplored, onClose, onKeepGoing }: DepthChallengeProps) {
  const milestone = MILESTONES[depth] || { title: `Level ${depth}`, emoji: '🌟', message: `You've reached depth ${depth}!` }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#12121a] border border-[#d4a853]/15 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#d4a853]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center relative">
          <div className="text-5xl mb-3">{milestone.emoji}</div>
          <div className="text-[9px] text-[#d4a853] uppercase tracking-widest font-bold mb-1">Achievement Unlocked</div>
          <h3 className="font-bold text-[#f0ece4] text-lg mb-2" style={{ fontFamily: "'Lora', serif" }}>
            {milestone.title}
          </h3>
          <p className="text-[12px] text-white/35 mb-4 leading-relaxed">{milestone.message}</p>

          <div className="bg-white/[0.02] rounded-lg px-4 py-2.5 mb-4 border border-white/[0.04]">
            <div className="text-[10px] text-white/20">Your stats</div>
            <div className="text-[14px] text-[#f0ece4] font-bold">{nodesExplored} nodes · Depth {depth}</div>
          </div>

          <button
            onClick={onKeepGoing}
            className="w-full py-2.5 rounded-xl bg-[#d4a853]/10 border border-[#d4a853]/20 text-[#f0d888] font-bold text-[12px] hover:bg-[#d4a853]/15 transition-all"
          >
            How deep can I go? →
          </button>
        </div>
      </div>
    </div>
  )
}
