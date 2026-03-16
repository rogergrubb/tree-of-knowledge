import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog - Learning Tips, Study Guides & Knowledge Exploration',
  description: 'Expert guides on learning faster, studying smarter, and exploring any topic in depth. Free resources for students, researchers, and lifelong learners.',
  keywords: ['learning tips', 'study guides', 'how to learn', 'education blog', 'knowledge exploration'],
}

const posts = [
  {
    slug: 'how-to-learn-anything-fast',
    title: 'How to Learn Anything Fast: The Science-Backed Method',
    description: 'Discover the proven techniques used by top learners to master any subject in record time. From spaced repetition to active recall.',
    date: '2026-03-15',
    readTime: '8 min read',
  },
  {
    slug: 'visual-learning-techniques',
    title: 'Visual Learning Techniques: How Knowledge Maps Accelerate Understanding',
    description: 'Learn how visual representations of information can dramatically improve comprehension, retention, and recall.',
    date: '2026-03-14',
    readTime: '7 min read',
  },
  {
    slug: 'best-free-learning-resources-2026',
    title: 'Best Free Learning Resources in 2026: The Complete Guide',
    description: 'A curated list of the best free online learning tools, websites, and resources for self-directed learners.',
    date: '2026-03-13',
    readTime: '10 min read',
  },
  {
    slug: 'ai-powered-learning-tools',
    title: 'AI-Powered Learning Tools: How Artificial Intelligence is Revolutionizing Education',
    description: 'Explore how AI tutors, adaptive learning systems, and intelligent knowledge tools are transforming how we learn.',
    date: '2026-03-12',
    readTime: '9 min read',
  },
  {
    slug: 'self-study-guide-any-subject',
    title: 'The Ultimate Self-Study Guide: How to Teach Yourself Any Subject',
    description: 'A complete framework for self-directed learning. From choosing what to study to measuring your progress.',
    date: '2026-03-11',
    readTime: '11 min read',
  },
]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#0a1424] text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <header className="mb-12">
          <Link href="/" className="text-green-400 hover:text-green-300 mb-4 inline-block">
            â† Back to Tree of Knowledge
          </Link>
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-gray-400 text-lg">
            Expert guides on learning faster, studying smarter, and exploring any topic in depth.
          </p>
        </header>

        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.slug} className="border border-gray-800 rounded-lg p-6 hover:border-green-500/50 transition-colors">
              <Link href={`/blog/${post.slug}`}>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                  <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                  <span>â€¢</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="text-xl font-semibold mb-2 text-white hover:text-green-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-400">{post.description}</p>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
