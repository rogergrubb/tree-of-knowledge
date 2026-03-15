import { NextRequest, NextResponse } from 'next/server'

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const body = await req.json()
    const { action, nodeName, nodeDesc, path, query } = body

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 })
    }

    // AI-powered search — resolve any query to a knowledge tree path
    if (action === 'search') {
      if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

      const searchSystem = `You are the search engine for "The Tree of Knowledge" — an encyclopedia that organizes ALL human knowledge into a navigable tree.

Given a user's search query (which may be misspelled, vague, or use slang), you must:
1. Figure out what they're actually looking for
2. Determine where it belongs in the tree of human knowledge
3. Return the full path from root to the topic

The top-level branches of the tree are:
- Natural Sciences (Physics, Chemistry, Biology, Earth Science, Astronomy)
- Technology (Computer Science, Engineering, Energy, Space Tech)
- Medicine (Human Body, Medical Practice, Mental Health, Public Health, Pharmacology)
- Humanities (History, Literature, Religion, Languages)
- Arts (Visual Arts, Music, Performing, Design)
- Social Sciences (Psychology, Economics, Government, Sociology, Geography)
- Foundations/Roots (Logic & Reasoning, Mathematics, Philosophy, Language)

CRITICAL: Respond with ONLY a JSON object. No markdown, no backticks, no explanation. Just raw JSON.

Return this exact format:
{
  "correctedTerm": "the actual correct name of what they searched for",
  "path": ["Top Branch", "Sub-category", "Sub-sub-category", "The Topic"],
  "desc": "one-sentence description of the topic",
  "icon": "single relevant emoji"
}

The path should be 3-5 levels deep, going from a top-level branch down to the specific topic. Each level should be a real, recognized field or topic name (2-4 words max).`

      const searchUser = `The user searched for: "${query}"

What topic are they looking for, and where does it belong in the tree of human knowledge? Return the JSON path.`

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 500,
          system: searchSystem,
          messages: [{ role: 'user', content: searchUser }]
        })
      })

      if (!response.ok) {
        return NextResponse.json({ error: 'AI search failed' }, { status: 502 })
      }

      const data = await response.json()
      const text = data.content?.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n') || ''

      try {
        const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
        const result = JSON.parse(cleaned)
        return NextResponse.json({ result })
      } catch {
        return NextResponse.json({ result: null, error: 'Could not parse search result' })
      }
    }

    if (!nodeName) {
      return NextResponse.json({ error: 'Missing nodeName' }, { status: 400 })
    }

    const pathStr = (path || []).join(' > ')
    let systemPrompt: string
    let userPrompt: string

    if (action === 'subtopics') {
      systemPrompt = `You are a knowledge taxonomist for "The Tree of Knowledge" — an interactive encyclopedia that organizes ALL human knowledge into a navigable tree. You generate subtopics for any area of knowledge.

CRITICAL: Respond with ONLY a JSON array. No markdown, no backticks, no explanation. Just the raw JSON array.

Each subtopic should be a JSON object with:
- "name": short topic name (2-4 words max)
- "desc": one-sentence accessible description (aim for a bright high school student)
- "icon": a single relevant emoji

Generate 4-7 subtopics that are:
1. Genuine, recognized subdivisions of the field
2. Mutually exclusive (no overlap)
3. Collectively exhaustive (cover the major areas)
4. Ordered from most fundamental to most specialized`

      userPrompt = `Generate subtopics for "${nodeName}" (${nodeDesc || 'a topic'}).
Path in knowledge tree: ${pathStr}

Return ONLY a JSON array like: [{"name":"X","desc":"Y","icon":"Z"},...]`

    } else if (action === 'article') {
      systemPrompt = `You are writing for "The Tree of Knowledge" — an AI-powered encyclopedia. Write a brief, engaging article about a topic.

FORMAT RULES:
- Write 2-3 short paragraphs (total ~120 words)
- Use simple, accessible language (bright high school student level)
- In the text, wrap 3-5 key related terms in double brackets like [[term]]. These become clickable links that drill deeper into the knowledge tree.
- The [[bracketed terms]] should be real subtopics or related concepts that could branch further.
- Be factual, engaging, and concise. No fluff.
- Do NOT use headers, bullet points, or markdown formatting. Just flowing paragraphs.`

      userPrompt = `Write about "${nodeName}" (${nodeDesc || 'a topic'}).
Knowledge path: ${pathStr}`

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', response.status, err)
      return NextResponse.json({ error: 'AI service error' }, { status: 502 })
    }

    const data = await response.json()
    const text = data.content
      ?.filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n') || ''

    if (action === 'subtopics') {
      try {
        const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
        const parsed = JSON.parse(cleaned)
        if (Array.isArray(parsed)) {
          return NextResponse.json({
            subtopics: parsed.map((item: any) => ({
              name: String(item.name || 'Unknown'),
              desc: String(item.desc || ''),
              icon: String(item.icon || '📄')
            }))
          })
        }
      } catch {
        // Fallback
      }
      return NextResponse.json({
        subtopics: [
          { name: `${nodeName} Basics`, desc: `Fundamental concepts`, icon: '📘' },
          { name: `${nodeName} Methods`, desc: `Key approaches`, icon: '🔍' },
          { name: `${nodeName} Applications`, desc: `Real-world uses`, icon: '⚡' },
          { name: `Advanced ${nodeName}`, desc: `Cutting-edge research`, icon: '🔬' }
        ]
      })
    }

    return NextResponse.json({ article: text })

  } catch (err) {
    console.error('API route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
