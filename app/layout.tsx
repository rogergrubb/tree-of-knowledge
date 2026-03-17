import type { Metadata } from "next"
import "./globals.css"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://treeofknowledge.dev'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'The Tree of Knowledge - Explore Every Branch of Human Understanding',
    template: '%s | Tree of Knowledge',
  },
  description: 'Explore all human knowledge as an interactive, AI-powered tree. From quantum physics to ancient history - infinite depth on every topic. Free for everyone.',
  keywords: [
    'tree of knowledge', 'knowledge tree', 'interactive encyclopedia', 'AI learning tool',
    'knowledge map', 'visual learning', 'study guide', 'free encyclopedia', 'AI tutor',
    'explore topics', 'homework help', 'research tool', 'learn anything', 'study companion',
    'AI study companion', 'visual encyclopedia', 'deep research tool',
  ],
  authors: [{ name: 'NumberOneSon Software' }],
  creator: 'NumberOneSon Software',
  publisher: 'NumberOneSon Software',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'The Tree of Knowledge',
    title: 'The Tree of Knowledge - Explore Every Branch of Human Understanding',
    description: 'Explore all human knowledge as an interactive, AI-powered tree. Infinite depth on every topic. Free for everyone.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'The Tree of Knowledge - Explore Every Branch of Human Understanding',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Tree of Knowledge - Explore Every Branch of Human Understanding',
    description: 'Explore all human knowledge as an interactive, AI-powered tree. Infinite depth on every topic.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: baseUrl },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'The Tree of Knowledge',
    url: baseUrl,
    description: 'An interactive, AI-powered encyclopedia that lets you explore every branch of human knowledge through a visual tree interface.',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    creator: { '@type': 'Organization', name: 'NumberOneSon Software' },
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Nunito:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="antialiased bg-[#0a1424]">
        {children}
      </body>
    </html>
  )
}
