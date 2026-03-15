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

      const searchSystem = `You are the world's most intelligent search engine for "The Tree of Knowledge" — an encyclopedia organizing ALL human knowledge.

Your job is to figure out what the user is ACTUALLY looking for, even when their query is:
- Badly misspelled ("plubicon tube" → Jarvik-7 artificial heart, or Plumbicon camera tube)
- A partial memory ("that tube thing for hearts" → artificial heart / ventricular assist device)
- Slang or colloquial ("brain zaps" → SSRI discontinuation syndrome)
- A phonetic approximation ("noo-mohnya" → pneumonia)
- An obscure reference only an expert would know
- A brand name, person's name, historical event, specific device, technique, or concept
- Ambiguous — could belong to multiple fields

REASONING PROCESS:
1. Consider multiple interpretations of the query
2. Think about what domain the user most likely means
3. Consider phonetic similarity, common misspellings, and partial matches
4. If it could be a specific invention, device, person, technique, chemical, species, theorem, artwork, or historical event — identify the SPECIFIC thing, not just the general category
5. Place it precisely in the knowledge tree

The top-level branches are:
- Natural Sciences (Physics, Chemistry, Biology, Earth Science, Astronomy)
- Technology (Computer Science, Engineering, Energy, Space Tech, Telecommunications)
- Medicine (Human Body, Medical Practice, Mental Health, Public Health, Pharmacology, Biomedical Research, Medical Devices)
- Humanities (History, Literature, Religion, Languages)
- Arts (Visual Arts, Music, Performing, Design)
- Social Sciences (Psychology, Economics, Government, Sociology, Geography)
- Foundations (Logic & Reasoning, Mathematics, Philosophy, Language)

CRITICAL: Respond with ONLY a JSON object. No markdown, no backticks, no thinking, no explanation. Just raw JSON.

{
  "correctedTerm": "the actual correct name (e.g. 'Jarvik-7 Artificial Heart')",
  "path": ["Top Branch", "Sub-category", "Sub-sub-category", "Specific Topic"],
  "desc": "one clear sentence describing what this is, written for a smart high school student",
  "icon": "single relevant emoji"
}

Path must be 3-6 levels deep. Each level should be a real, recognized field or topic (2-5 words max). The final item in the path should be the SPECIFIC thing the user was looking for, not a general category.`

      const searchUser = `The user searched for: "${query}"

Identify the most likely thing they're looking for. Consider all possible interpretations — medical devices, scientific instruments, historical inventions, techniques, people, concepts. Return the JSON.`

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
