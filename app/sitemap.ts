import { MetadataRoute } from 'next'
import { flattenAllPaths } from '@/lib/knowledge-tree'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tree-of-knowledge-roger-grubbs-projects-2e0adcba.vercel.app'

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
  ]

  // Blog pages
  const blogPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blog/how-to-learn-anything-fast`, lastModified: new Date('2026-03-15'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog/visual-learning-techniques`, lastModified: new Date('2026-03-14'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog/best-free-learning-resources-2026`, lastModified: new Date('2026-03-13'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog/ai-powered-learning-tools`, lastModified: new Date('2026-03-12'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog/self-study-guide-any-subject`, lastModified: new Date('2026-03-11'), changeFrequency: 'monthly', priority: 0.8 },
  ]

  // All topic pages from knowledge tree
  const topicPaths = flattenAllPaths()
  const topicPages: MetadataRoute.Sitemap = topicPaths.map(path => ({
    url: `${baseUrl}/topic/${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path.split('/').length <= 2 ? 0.8 : 0.7,
  }))

  return [...staticPages, ...blogPages, ...topicPages]
}