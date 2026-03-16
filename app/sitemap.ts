import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://treeofknowledge.dev'
  
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blog/how-to-learn-anything-fast`, lastModified: new Date('2026-03-15'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog/visual-learning-techniques`, lastModified: new Date('2026-03-14'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog/best-free-learning-resources-2026`, lastModified: new Date('2026-03-13'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog/ai-powered-learning-tools`, lastModified: new Date('2026-03-12'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog/self-study-guide-any-subject`, lastModified: new Date('2026-03-11'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/topic`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ]
}