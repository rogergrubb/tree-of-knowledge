import { NextRequest, NextResponse } from 'next/server'

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ content: '<p>Content is being generated. Please check back soon.</p>' })

  try {
    const { topic, path, parentLabel } = await req.json()
    if (!topic) return NextResponse.json({ content: '<p>Topic not specified.</p>' }, { status: 400 })

    const pathContext = parentLabel ? `This topic falls under: ${parentLabel}.` : ''

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system: `You are writing educational content for "The Tree of Knowledge" — an AI-powered interactive encyclopedia. Write a comprehensive, engaging article about the given topic.

FORMAT: Return valid HTML paragraphs only (<p> tags). Use <strong> for key terms on first mention. Use <a href="/topic/PATH"> for internal links to related topics (use lowercase-hyphenated paths). Write 4-6 paragraphs. Aim for a bright high school student reading level. Be accurate, engaging, and educational. Do NOT use markdown. Do NOT use headers (the page already has an h1). Do NOT include <html>, <body>, or <head> tags.`,
        messages: [{ role: 'user', content: `Write an educational article about "${topic}". ${pathContext} Return HTML paragraphs.` }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ content: `<p>${topic} is a fascinating area of knowledge. Explore the subtopics below to learn more.</p>` })
    }

    const data = await response.json()
    const text = data.content?.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n') || ''

    // Clean up any markdown artifacts
    const cleaned = text
      .replace(/```html\s*/g, '').replace(/```\s*/g, '')
      .replace(/^#+ .+$/gm, '') // remove any markdown headers
      .trim()

    return NextResponse.json({ content: cleaned || `<p>${topic} is an area of human knowledge worth exploring. Dive into the subtopics below.</p>` })
  } catch {
    return NextResponse.json({ content: '<p>Content is being prepared. Please check back soon.</p>' })
  }
}
