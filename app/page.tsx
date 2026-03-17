import Link from 'next/link'
import TreeApp from './components/TreeApp'

// Static content for SEO - rendered on server, visible to crawlers
const TOPICS = [
  { name: 'Natural Sciences', path: '/topic/natural-sciences', icon: '🔬', desc: 'Physics, chemistry, biology, earth sciences, and astronomy' },
  { name: 'Technology', path: '/topic/technology', icon: '💻', desc: 'Computer science, engineering, electronics, and innovation' },
  { name: 'Medicine', path: '/topic/medicine', icon: '🏥', desc: 'Health, anatomy, diseases, treatments, and medical research' },
  { name: 'Humanities', path: '/topic/humanities', icon: '📚', desc: 'History, philosophy, literature, languages, and religion' },
  { name: 'Social Sciences', path: '/topic/social-sciences', icon: '🌍', desc: 'Psychology, sociology, economics, politics, and anthropology' },
  { name: 'Arts', path: '/topic/arts', icon: '🎨', desc: 'Visual arts, music, theater, film, and creative expression' },
  { name: 'Mathematics', path: '/topic/mathematics', icon: '📐', desc: 'Pure math, applied math, statistics, and logic' },
]

export default function HomePage() {
  return (
    <>
      {/* SEO Content - Server Rendered, visible to crawlers */}
      {/* This content is positioned absolutely and hidden visually but remains in the DOM for SEO */}
      <div className="sr-only" aria-hidden="false">
        <header>
          <h1>The Tree of Knowledge</h1>
          <p>
            An interactive, AI-powered encyclopedia that lets you explore every branch of human knowledge. 
            Navigate topics from quantum physics to ancient history through a visual tree interface. 
            Free for everyone, no account required.
          </p>
        </header>
        
        <main>
          <section>
            <h2>Explore Topics</h2>
            <p>Dive into any branch of human knowledge. Each topic expands infinitely with AI-generated educational content.</p>
            <nav aria-label="Main topics">
              <ul>
                {TOPICS.map(topic => (
                  <li key={topic.path}>
                    <Link href={topic.path}>
                      <span>{topic.icon}</span>
                      <span>{topic.name}</span>
                      <span>{topic.desc}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          <section>
            <h2>How It Works</h2>
            <p>Click any topic to explore deeper. The Tree of Knowledge uses AI to generate educational content on demand, creating an infinitely deep encyclopedia on any subject.</p>
            <ul>
              <li>Click a branch to explore subtopics</li>
              <li>Read AI-generated articles on any topic</li>
              <li>Listen with text-to-speech</li>
              <li>Search across all human knowledge</li>
              <li>No sign-up required — completely free</li>
            </ul>
          </section>

          <section>
            <h2>Features</h2>
            <ul>
              <li>Infinite depth exploration on any topic</li>
              <li>AI-powered educational content</li>
              <li>Visual tree interface for intuitive navigation</li>
              <li>Text-to-speech for accessibility</li>
              <li>Ambient music for focused learning</li>
              <li>Search anything in human knowledge</li>
              <li>Mobile and desktop friendly</li>
              <li>No account required</li>
            </ul>
          </section>
        </main>

        <footer>
          <p>© 2026 NumberOneSon Software. Free educational tool powered by AI.</p>
          <nav aria-label="Legal">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/accessibility">Accessibility</Link>
          </nav>
        </footer>
      </div>

      {/* Visible SEO fallback for non-JS / slow connections */}
      <noscript>
        <div className="min-h-screen bg-[#0a1424] text-white p-8" style={{ fontFamily: 'system-ui, sans-serif' }}>
          <h1 className="text-3xl font-bold mb-4">The Tree of Knowledge</h1>
          <p className="mb-6 text-lg text-gray-300">
            An interactive, AI-powered encyclopedia that lets you explore every branch of human knowledge.
            Navigate topics from quantum physics to ancient history through a visual tree interface.
            Free for everyone, no account required.
          </p>
          <h2 className="text-2xl font-semibold mb-4">Explore Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOPICS.map(topic => (
              <a 
                key={topic.path} 
                href={topic.path}
                className="block p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="text-2xl mb-2">{topic.icon}</div>
                <div className="font-semibold text-lg">{topic.name}</div>
                <div className="text-sm text-gray-400">{topic.desc}</div>
              </a>
            ))}
          </div>
          <p className="mt-8 text-sm text-gray-500">
            JavaScript is required for the full interactive experience.
          </p>
        </div>
      </noscript>

      {/* Interactive App - Client Rendered */}
      <TreeApp />
    </>
  )
}
