import { MetadataRoute } from 'next'
import { flattenAllPaths } from '@/lib/knowledge-tree'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tree-of-knowledge-roger-grubbs-projects-2e0adcba.vercel.app'

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
  ]

  const topicPaths = flattenAllPaths()
  const topicPages: MetadataRoute.Sitemap = topicPaths.map(path => ({
    url: `${baseUrl}/topic/${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path.split('/').length <= 2 ? 0.8 : 0.7,
  }))

  return [...staticPages, ...topicPages]
}
