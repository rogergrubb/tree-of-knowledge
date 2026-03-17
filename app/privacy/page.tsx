import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for The Tree of Knowledge - how we handle your data.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a1424] text-[#c0bab0]" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-[#f0d888] hover:text-[#f0d888]/80 mb-8 text-sm">
          ← Back to Tree of Knowledge
        </Link>
        
        <h1 className="text-3xl font-bold text-[#f0ece4] mb-2" style={{ fontFamily: "'Lora', serif" }}>Privacy Policy</h1>
        <p className="text-sm text-white/30 mb-8">Last updated: March 16, 2026</p>

        <div className="space-y-8 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">Overview</h2>
            <p>The Tree of Knowledge ("we", "us", "our") is committed to protecting your privacy. This policy explains how we collect, use, and safeguard information when you use our website.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">Information We Collect</h2>
            <p className="mb-3"><strong className="text-[#f0ece4]">Automatically Collected:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Browser type and version</li>
              <li>Pages visited and time spent</li>
              <li>Referring website</li>
              <li>General location (country/region, not precise)</li>
              <li>Device type (desktop, mobile, tablet)</li>
            </ul>
            <p className="mt-4 mb-3"><strong className="text-[#f0ece4]">What We Don't Collect:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal identification information (no accounts required)</li>
              <li>Email addresses (unless you voluntarily provide one)</li>
              <li>Precise location data</li>
              <li>Payment information (handled securely by Stripe)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">How We Use Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To improve the website and user experience</li>
              <li>To understand which topics are most popular</li>
              <li>To maintain and optimize performance</li>
              <li>To detect and prevent abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">AI Processing</h2>
            <p>When you explore topics, your queries are processed by third-party AI services (such as OpenAI or Anthropic) to generate educational content. These queries are not linked to your personal identity and are used solely to provide the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">Local Storage</h2>
            <p>We use browser localStorage to remember your preferences (such as music settings and navigation history). This data stays on your device and is not transmitted to our servers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">Cookies</h2>
            <p>We use minimal cookies for essential functionality. We do not use advertising cookies or sell your data to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">Third-Party Services</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Stripe:</strong> Processes donations securely. See <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#f0d888] hover:underline">Stripe's Privacy Policy</a>.</li>
              <li><strong>Vercel:</strong> Hosts our website. See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#f0d888] hover:underline">Vercel's Privacy Policy</a>.</li>
              <li><strong>AI Providers:</strong> Process educational queries. Data is not stored permanently.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">Children's Privacy</h2>
            <p>Our service is educational and suitable for all ages. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">Your Rights</h2>
            <p className="mb-3">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access information we hold about you</li>
              <li>Request deletion of your data</li>
              <li>Opt out of tracking</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
            <p className="mt-3">Since we collect minimal data and don't require accounts, most data can be cleared by clearing your browser's localStorage.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">California Residents (CCPA)</h2>
            <p>California residents have the right to know what personal information is collected, request deletion, and opt out of sale. We do not sell personal information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">European Users (GDPR)</h2>
            <p>We process data based on legitimate interest (providing the service) and consent where required. You may exercise your GDPR rights by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">Changes to This Policy</h2>
            <p>We may update this policy from time to time. Significant changes will be noted with an updated "Last updated" date.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#f0ece4] mb-3">Contact</h2>
            <p>Questions about this policy? Contact us at: <a href="mailto:privacy@numberonesonsoftware.com" className="text-[#f0d888] hover:underline">privacy@numberonesonsoftware.com</a></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/30">
          <p>© 2026 NumberOneSon Software. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
