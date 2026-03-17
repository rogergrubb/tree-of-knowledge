import Link from 'next/link'

export const metadata = {
  title: 'Accessibility',
  description: 'Accessibility statement for The Tree of Knowledge.',
}

export default function Accessibility() {
  return (
    <div className="min-h-screen bg-[#0a1424] text-[#c0bab0]" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-[#f0d888] hover:text-[#f0d888]/80 mb-8 text-sm">
          ← Back to Tree of Knowledge
        </Link>
        
        <h1 className="text-3xl font-bold text-[#f0ece4] mb-2" style={{ fontFamily: "'Lora', serif" }}>Accessibility Statement</h1>
        <p className="text-sm text-white/30 mb-8">Last updated: March 16, 2026</p>

        <div className="space-y-8 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">Our Commitment</h2>
            <p>The Tree of Knowledge is committed to ensuring digital accessibility for people of all abilities. We continually work to improve the user experience and maintain compliance with relevant accessibility standards.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">Accessibility Features</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Keyboard navigation support</li>
              <li>Text-to-speech for article content</li>
              <li>High contrast text on dark background</li>
              <li>Resizable interface panels</li>
              <li>Clear visual hierarchy</li>
              <li>Semantic HTML structure</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">Standards</h2>
            <p>We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. This is an ongoing effort and we welcome feedback.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">Known Limitations</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>The interactive tree visualization may be challenging for screen reader users - we provide text alternatives in the wiki panel</li>
              <li>Some dynamic content may not be immediately announced to assistive technologies</li>
              <li>Color is used for emphasis but not as the only means of conveying information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">Feedback</h2>
            <p>We welcome your feedback on the accessibility of The Tree of Knowledge. If you encounter barriers or have suggestions, please contact us:</p>
            <p className="mt-3">
              <a href="mailto:accessibility@numberonesonsoftware.com" className="text-[#f0d888] hover:underline">accessibility@numberonesonsoftware.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">Continuous Improvement</h2>
            <p>We regularly review our website to identify and fix accessibility issues. This statement will be updated as we make improvements.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/30">
          <p>© 2026 NumberOneSon Software. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
