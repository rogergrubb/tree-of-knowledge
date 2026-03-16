'use client'

import { useState } from 'react'

const STRIPE_LINK = 'https://buy.stripe.com/eVqaEZdeU15r1nE2mcaIM0U'

export default function SupportButton() {
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <>
      {/* Pulsing capsule button — fixed position */}
      <div className="fixed bottom-20 right-4 z-40">
        {expanded ? (
          <div className="bg-[#12192b] border border-[#d4a853]/30 rounded-2xl p-5 shadow-2xl max-w-[300px] animate-in">
            {/* Close */}
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-2 right-3 text-white/20 hover:text-white/50 text-sm"
            >
              ✕
            </button>

            {/* Message */}
            <div className="text-center mb-4">
              <div className="text-2xl mb-2">🌳</div>
              <p className="text-[13px] text-[#c0bab0] leading-relaxed">
                <strong className="text-[#f0ece4]">This is 100% free.</strong> No paywall. No account required. Ever.
              </p>
              <p className="text-[12px] text-white/30 mt-2 leading-relaxed">
                But every topic you explore costs real money in AI tokens. 
                The server bills don&apos;t pay themselves. 
                If this helped you study, learn, or discover something new&mdash;
              </p>
            </div>

            {/* CTA */}
            <a
              href={STRIPE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3 rounded-xl font-bold text-[#0a0e18] text-sm
                bg-gradient-to-r from-[#d4a853] to-[#e8c56a] hover:from-[#e8c56a] hover:to-[#f0d888]
                transition-all shadow-lg shadow-[#d4a853]/20 hover:shadow-[#d4a853]/40
                active:scale-95"
            >
              ☕ Buy Me a Coffee — $5
            </a>

            <p className="text-center text-[10px] text-white/15 mt-3">
              Processed securely by Stripe
            </p>

            {/* Dismiss forever */}
            <button
              onClick={() => {
                setDismissed(true)
                try { localStorage.setItem('tok-support-dismissed', 'true') } catch {}
              }}
              className="block w-full text-center text-[10px] text-white/15 hover:text-white/30 mt-1 transition-colors"
            >
              No thanks, don&apos;t show again
            </button>
          </div>
        ) : (
          <button
            onClick={() => setExpanded(true)}
            className="group relative flex items-center gap-2 px-5 py-2.5 rounded-full
              bg-gradient-to-r from-[#d4a853]/15 to-[#d4a853]/10
              border border-[#d4a853]/25 hover:border-[#d4a853]/50
              text-[#f0d888] text-[13px] font-semibold
              shadow-lg shadow-[#d4a853]/10 hover:shadow-[#d4a853]/25
              transition-all duration-300"
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full animate-ping opacity-[0.08] bg-[#d4a853]" />

            <span className="relative flex items-center gap-2">
              <span className="text-base">☕</span>
              <span>Support the Tree</span>
            </span>
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes animate-in {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-in {
          animation: animate-in 0.25s ease-out;
        }
      `}</style>
    </>
  )
}
