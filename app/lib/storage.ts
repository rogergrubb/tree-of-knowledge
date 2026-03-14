import { UserProgress } from "./ai"


const KEYS = {
  progress: 'tok_progress',
  explored: 'tok_explored',
  bookmarks: 'tok_bookmarks',
  sessions: 'tok_sessions'
}

const defaultProgress: UserProgress = {
  nodesExplored: 0,
  deepestLevel: 0,
  lastExplored: new Date().toISOString(),
  sessions: 1
}

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(KEYS.progress)
    if (raw) {
      const p = JSON.parse(raw)
      p.sessions = (p.sessions || 0) + 1
      return p
    }
  } catch {}
  return { ...defaultProgress }
}

export function saveProgress(p: UserProgress) {
  try {
    localStorage.setItem(KEYS.progress, JSON.stringify(p))
  } catch {}
}

export function loadExploredNodes(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.explored)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveExploredNode(name: string) {
  try {
    const existing = loadExploredNodes()
    if (!existing.includes(name)) {
      existing.push(name)
      localStorage.setItem(KEYS.explored, JSON.stringify(existing))
    }
  } catch {}
}

export function loadBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.bookmarks)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveBookmark(name: string) {
  try {
    const existing = loadBookmarks()
    if (!existing.includes(name)) {
      existing.push(name)
      localStorage.setItem(KEYS.bookmarks, JSON.stringify(existing))
    }
  } catch {}
}

export function removeBookmark(name: string) {
  try {
    const existing = loadBookmarks()
    localStorage.setItem(KEYS.bookmarks, JSON.stringify(existing.filter(b => b !== name)))
  } catch {}
}
