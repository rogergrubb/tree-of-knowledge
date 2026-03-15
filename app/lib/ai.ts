export interface KnowledgeNode {
  name: string
  desc?: string
  icon?: string
  hue?: number
  sat?: number
  children?: KnowledgeNode[]
  isRoot?: boolean
  _aiGenerated?: boolean
  _x?: number
  _y?: number
  _r?: number
  _bx?: number
  _by?: number
  _type?: 'branch' | 'root'
}

export async function generateSubtopics(
  nodeName: string,
  nodeDesc: string,
  path: string[]
): Promise<KnowledgeNode[]> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'subtopics', nodeName, nodeDesc, path })
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const data = await res.json()
    return data.subtopics || []
  } catch (err) {
    console.error('Subtopic generation failed:', err)
    return [
      { name: `${nodeName} Basics`, desc: 'Fundamental concepts', icon: '📘' },
      { name: `${nodeName} Methods`, desc: 'Key approaches', icon: '🔍' },
      { name: `${nodeName} Applications`, desc: 'Real-world uses', icon: '⚡' },
      { name: `Advanced ${nodeName}`, desc: 'Cutting-edge research', icon: '🔬' }
    ]
  }
}

export async function generateArticle(
  nodeName: string,
  nodeDesc: string,
  path: string[]
): Promise<string> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'article', nodeName, nodeDesc, path })
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const data = await res.json()
    return data.article || `**${nodeName}** — ${nodeDesc}`
  } catch {
    return `**${nodeName}** — ${nodeDesc}. Explore the branches below to learn more.`
  }
}

export interface UserProgress {
  nodesExplored: number
  deepestLevel: number
  lastExplored: string
  sessions: number
}

export interface AISearchResult {
  correctedTerm: string
  path: string[]
  desc: string
  icon: string
}

export async function searchKnowledge(query: string): Promise<AISearchResult | null> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'search', query })
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const data = await res.json()
    return data.result || null
  } catch {
    return null
  }
}
