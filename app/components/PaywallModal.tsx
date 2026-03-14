"use client"
interface PaywallModalProps {
  depth: number
  onClose: () => void
  onUpgrade: () => void
}

export function PaywallModal({ depth, onClose, onUpgrade }: PaywallModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-[#12121a] border border-white/8 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Glow effect */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#d4a853]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center relative">
          <div className="text-4xl mb-3">🌳</div>
          <h3 className="font-bold text-[#f0ece4] text-xl mb-1" style={{ fontFamily: "'Lora', serif" }}>
            You've Reached Depth {depth}
          </h3>
          <p className="text-[13px] text-white/40 mb-5 leading-relaxed">
            You've explored deeper than 95% of knowledge seekers.
            Unlock unlimited depth to keep discovering what lies beneath every branch of human understanding.
          </p>

          {/* What you get */}
          <div className="bg-white/[0.02] rounded-xl p-4 mb-5 border border-white/[0.04] text-left">
            <div className="text-[10px] text-[#d4a853] uppercase tracking-wider font-bold mb-2">
              Tree of Knowledge Pro
            </div>
            <div className="space-y-2">
              {[
                '∞ Unlimited depth — explore as deep as knowledge goes',
                '📖 AI-generated articles at every level',
                '☁ Cloud sync — continue from any device',
                '🌱 Community branches — see what others discover',
                '📊 Advanced learning analytics'
              ].map((item, i) => (
                <div key={i} className="text-[12px] text-white/50 flex items-start gap-2">
                  <span className="text-[10px] mt-0.5">{item.slice(0, 2)}</span>
                  <span>{item.slice(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="mb-4">
            <span className="text-3xl font-bold text-[#f0ece4]">$4</span>
            <span className="text-white/30 text-sm">/month</span>
            <div className="text-[10px] text-white/20 mt-0.5">Less than a coffee. Cancel anytime.</div>
          </div>

          {/* CTA */}
          <button
            onClick={onUpgrade}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#e8c56a] text-[#0c0c0e] font-bold text-sm hover:opacity-90 transition-opacity mb-2.5"
          >
            Unlock Unlimited Knowledge
          </button>

          <button
            onClick={onClose}
            className="text-[11px] text-white/20 hover:text-white/40 transition-colors"
          >
            Maybe later — I'll explore what I have
          </button>
        </div>
      </div>
    </div>
  )
}
