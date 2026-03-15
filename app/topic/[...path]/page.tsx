import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { KNOWLEDGE_TREE, findNode, flattenAllPaths } from '@/lib/knowledge-tree'

interface TopicPageProps {
  params: Promise<{ path: string[] }>
}

export async function generateStaticParams() {
  return flattenAllPaths().map(p => ({ path: p.split('/') }))
}

export async function generateMetadata(props: TopicPageProps): Promise<Metadata> {
  const { path } = await props.params
  const node = findNode(KNOWLEDGE_TREE, path)
  if (!node) return {}
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tree-of-knowledge-roger-grubbs-projects-2e0adcba.vercel.app'
  const fullPath = path.join('/')
  const breadcrumbText = path.map(s => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(' > ')
  return {
    title: `${node.label} — Learn, Explore, Go Deeper`,
    description: node.description || `Explore ${node.label} in depth. Interactive AI-powered articles and visual knowledge tree. Part of ${breadcrumbText}. Free for everyone.`,
    openGraph: {
      title: `${node.label} — Tree of Knowledge`,
      description: node.description || `Explore ${node.label} through an interactive, AI-powered knowledge tree.`,
      url: `${baseUrl}/topic/${fullPath}`,
      type: 'article',
    },
    alternates: { canonical: `${baseUrl}/topic/${fullPath}` },
  }
}

async function getTopicContent(path: string[], label: string): Promise<string> {
  try {
    const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
    const parentLabel = path.length > 1
      ? path.slice(0, -1).map(s => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(' > ')
      : null
    const res = await fetch(`${host}/api/topic-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: label, path, parentLabel }),
      next: { revalidate: 86400 * 7 },
    })
    if (res.ok) { const data = await res.json(); return data.content }
  } catch (e) { console.error('Topic content fetch failed:', e) }
  return `<p><strong>${label}</strong> is a branch of knowledge within the Tree of Knowledge. Explore the subtopics below to dive deeper.</p>`
}

export default async function TopicPage(props: TopicPageProps) {
  const { path } = await props.params
  const node = findNode(KNOWLEDGE_TREE, path)
  if (!node) notFound()

  const content = await getTopicContent(path, node.label)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tree-of-knowledge-roger-grubbs-projects-2e0adcba.vercel.app'

  const breadcrumbs = path.map((seg, i) => ({
    label: seg.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    href: `/topic/${path.slice(0, i + 1).join('/')}`,
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
          ...breadcrumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 2, name: c.label, item: `${baseUrl}${c.href}` })),
        ],
      },
      {
        '@type': 'Article', headline: node.label,
        description: node.description || `Learn about ${node.label}`,
        url: `${baseUrl}/topic/${path.join('/')}`,
        publisher: { '@type': 'Organization', name: 'NumberOneSon Software' },
        isPartOf: { '@type': 'WebSite', name: 'The Tree of Knowledge', url: baseUrl },
      },
      { '@type': 'EducationalResource', name: node.label, learningResourceType: 'Article', educationalLevel: 'All levels', isAccessibleForFree: true },
    ],
  }

  // Find siblings for related topics
  const parentNode = path.length > 1 ? findNode(KNOWLEDGE_TREE, path.slice(0, -1)) : null
  const siblings = parentNode?.children?.filter(c => c.path !== path[path.length - 1])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#0a0e18] text-gray-200" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {/* Header */}
        <header className="border-b border-white/5 bg-[#0a0e18]/90 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-[#d4a853] hover:text-[#f0d888] transition-colors">
              <span className="text-xl">🌳</span>
              <span className="font-semibold" style={{ fontFamily: "'Lora', serif" }}>Tree of Knowledge</span>
            </Link>
            <Link href={`/?topic=${encodeURIComponent(path.join('/'))}`}
              className="text-sm bg-[#d4a853]/15 hover:bg-[#d4a853]/25 text-[#f0d888] border border-[#d4a853]/20 px-4 py-2 rounded-lg transition-colors font-semibold">
              Open in Interactive Tree →
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-white/40">
              <li><Link href="/" className="hover:text-[#f0d888] transition-colors">🌳 Tree</Link></li>
              {breadcrumbs.map((crumb, i) => (
                <li key={crumb.href} className="flex items-center gap-1">
                  <span className="text-white/15">›</span>
                  {i === breadcrumbs.length - 1
                    ? <span className="text-[#f0d888]">{crumb.label}</span>
                    : <Link href={crumb.href} className="hover:text-[#f0d888] transition-colors">{crumb.label}</Link>
                  }
                </li>
              ))}
            </ol>
          </nav>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#f0ece4] mb-2" style={{ fontFamily: "'Lora', serif" }}>{node.label}</h1>
          {node.description && <p className="text-lg text-white/40 mb-8">{node.description}</p>}

          {/* Article */}
          <article className="prose prose-invert max-w-none mb-12 text-[#c0bab0] leading-relaxed"
            style={{ fontFamily: "'Nunito', sans-serif" }}
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Subtopics */}
          {node.children && node.children.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-[#f0ece4] mb-4" style={{ fontFamily: "'Lora', serif" }}>Explore Subtopics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {node.children.map(child => (
                  <Link key={child.path} href={`/topic/${[...path, child.path].join('/')}`}
                    className="block p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:border-[#d4a853]/30 hover:bg-white/[0.04] transition-all group">
                    <h3 className="font-semibold text-[#f0ece4] group-hover:text-[#f0d888] transition-colors">{child.label}</h3>
                    {child.description && <p className="text-sm text-white/30 mt-1">{child.description}</p>}
                    {child.children && <p className="text-xs text-white/15 mt-2">{child.children.length} subtopics →</p>}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related Topics (siblings) */}
          {siblings && siblings.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-[#f0ece4] mb-4" style={{ fontFamily: "'Lora', serif" }}>Related Topics</h2>
              <div className="flex flex-wrap gap-2">
                {siblings.map(s => (
                  <Link key={s.path} href={`/topic/${[...path.slice(0, -1), s.path].join('/')}`}
                    className="px-3 py-1.5 bg-white/[0.02] border border-white/[0.05] rounded-full text-sm text-white/40 hover:border-[#d4a853]/30 hover:text-[#f0d888] transition-all">
                    {s.label}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-br from-[#d4a853]/10 to-[#0a0e18] border border-[#d4a853]/15 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-[#f0ece4] mb-3" style={{ fontFamily: "'Lora', serif" }}>Want to go deeper?</h2>
            <p className="text-white/35 mb-6 max-w-lg mx-auto">Explore {node.label} visually in the interactive Tree of Knowledge. Click any branch to expand. AI generates infinite depth on every topic.</p>
            <Link href={`/?topic=${encodeURIComponent(path.join('/'))}`}
              className="inline-block bg-gradient-to-r from-[#d4a853] to-[#e8c56a] text-[#0a0e18] font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity">
              🌳 Open Interactive Tree
            </Link>
          </section>
        </main>

        {/* Footer with internal links for SEO */}
        <footer className="border-t border-white/5 mt-16 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-[#f0ece4] mb-3 text-sm">Explore</h3>
                <ul className="space-y-2 text-sm text-white/30">
                  <li><Link href="/topic/natural-sciences" className="hover:text-[#f0d888]">Natural Sciences</Link></li>
                  <li><Link href="/topic/technology" className="hover:text-[#f0d888]">Technology</Link></li>
                  <li><Link href="/topic/humanities" className="hover:text-[#f0d888]">Humanities</Link></li>
                  <li><Link href="/topic/mathematics" className="hover:text-[#f0d888]">Mathematics</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[#f0ece4] mb-3 text-sm">More Topics</h3>
                <ul className="space-y-2 text-sm text-white/30">
                  <li><Link href="/topic/medicine" className="hover:text-[#f0d888]">Medicine</Link></li>
                  <li><Link href="/topic/social-sciences" className="hover:text-[#f0d888]">Social Sciences</Link></li>
                  <li><Link href="/topic/arts" className="hover:text-[#f0d888]">Arts</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[#f0ece4] mb-3 text-sm">Deep Dives</h3>
                <ul className="space-y-2 text-sm text-white/30">
                  <li><Link href="/topic/natural-sciences/physics/quantum-mechanics" className="hover:text-[#f0d888]">Quantum Mechanics</Link></li>
                  <li><Link href="/topic/natural-sciences/biology/genetics" className="hover:text-[#f0d888]">Genetics</Link></li>
                  <li><Link href="/topic/technology/computer-science/artificial-intelligence" className="hover:text-[#f0d888]">Artificial Intelligence</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[#f0ece4] mb-3 text-sm">About</h3>
                <ul className="space-y-2 text-sm text-white/30">
                  <li><Link href="/" className="hover:text-[#f0d888]">Interactive Tree</Link></li>
                  <li><span className="text-white/15">Free for everyone</span></li>
                </ul>
              </div>
            </div>
            <p className="text-center text-xs text-white/15">&copy; {new Date().getFullYear()} The Tree of Knowledge by NumberOneSon Software. Free for everyone.</p>
          </div>
        </footer>
      </div>
    </>
  )
}
