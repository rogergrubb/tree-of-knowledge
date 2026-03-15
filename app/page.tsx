"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { TreeCanvas } from './components/TreeCanvas'
import { WikiPanel } from './components/WikiPanel'
import { KnowledgeNode, generateSubtopics, generateArticle } from './lib/ai'
import { SEED_TREE, ROOT_DATA, BRANCH_DATA } from './data/seedTree'

function countAll(n: KnowledgeNode): number { let c = 1; if (n.children) n.children.forEach(ch => c += countAll(ch)); return c }

// Flatten the tree for local search
function flattenTree(node: KnowledgeNode, path: KnowledgeNode[] = [], results: { node: KnowledgeNode, path: KnowledgeNode[] }[] = []) {
  const currentPath = [...path, node]
  results.push({ node, path: currentPath })
  if (node.children) node.children.forEach(ch => flattenTree(ch, currentPath, results))
  return results
}

export default function Home() {
  const [navStack, setNavStack] = useState<KnowledgeNode[]>([SEED_TREE])
  const [currentNode, setCurrentNode] = useState<KnowledgeNode>(SEED_TREE)
  const [wikiNode, setWikiNode] = useState<KnowledgeNode | null>(null)
  const [wikiContent, setWikiContent] = useState<string | null>(null)
  const [wikiLoading, setWikiLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingNode, setLoadingNode] = useState<KnowledgeNode | null>(null)
  const [totalNodes, setTotalNodes] = useState(0)
  const [mounted, setMounted] = useState(false)
  const generatingRef = useRef(false)
  const wikiAbortRef = useRef<AbortController | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ node: KnowledgeNode, path: KnowledgeNode[] }[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchGenerating, setSearchGenerating] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setTotalNodes(countAll(SEED_TREE)) }, [currentNode])
  const depth = navStack.length - 1

  // Load wiki article
  const loadArticle = useCallback(async (node: KnowledgeNode, path: string[]) => {
    if (wikiAbortRef.current) wikiAbortRef.current.abort()
    const controller = new AbortController()
    wikiAbortRef.current = controller
    setWikiNode(node)
    setWikiContent(null)
    setWikiLoading(true)
    try {
      const article = await generateArticle(node.name, node.desc || '', path)
      if (!controller.signal.aborted) setWikiContent(article)
    } catch {
      if (!controller.signal.aborted) setWikiContent(null)
    } finally {
      if (!controller.signal.aborted) setWikiLoading(false)
    }
  }, [])

  // Navigate into a node
  const drillInto = useCallback(async (node: KnowledgeNode) => {
    if (!node.children || node.children.length === 0) {
      if (generatingRef.current) return
      generatingRef.current = true; setIsGenerating(true); setLoadingNode(node)
      try {
        const path = [...navStack.map(n => n.name), node.name]
        node.children = await generateSubtopics(node.name, node.desc || '', path)
        node._aiGenerated = true
        setTotalNodes(countAll(SEED_TREE))
      }
      catch { node.children = [{ name: 'Try again', desc: 'AI temporarily unavailable', icon: '⚠️' }] }
      finally { setIsGenerating(false); generatingRef.current = false; setLoadingNode(null) }
    }
    const newStack = [...navStack, node]
    setNavStack(newStack)
    setCurrentNode(node)
    loadArticle(node, newStack.map(n => n.name))
  }, [navStack, loadArticle])

  // Navigate to a specific index in the stack
  const navigateTo = useCallback((i: number) => {
    const s = navStack.slice(0, i + 1)
    setNavStack(s)
    setCurrentNode(s[i])
    if (i === 0) { setWikiNode(null); setWikiContent(null) }
    else loadArticle(s[i], s.map(n => n.name))
  }, [navStack, loadArticle])

  // Go back one level
  const goBack = useCallback(() => {
    if (depth > 0) navigateTo(depth - 1)
  }, [depth, navigateTo])

  // Navigate directly to a search result (rebuilds full nav stack)
  const jumpToNode = useCallback((result: { node: KnowledgeNode, path: KnowledgeNode[] }) => {
    const newStack = result.path
    setNavStack(newStack)
    setCurrentNode(result.node)
    setSearchQuery('')
    setSearchResults([])
    setShowSearch(false)
    if (newStack.length > 1) {
      loadArticle(result.node, newStack.map(n => n.name))
    } else {
      setWikiNode(null)
      setWikiContent(null)
    }
  }, [loadArticle])

  // Search — filters existing tree nodes
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (query.trim().length < 2) { setSearchResults([]); return }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      const q = query.toLowerCase()
      const allNodes = flattenTree(SEED_TREE)
      const matches = allNodes.filter(item =>
        item.node.name !== 'All Knowledge' && (
          item.node.name.toLowerCase().includes(q) ||
          (item.node.desc && item.node.desc.toLowerCase().includes(q))
        )
      ).slice(0, 12)
      setSearchResults(matches)
    }, 150)
  }, [])

  // Wiki link handler
  const handleWikiLink = useCallback((term: string) => {
    const ch = currentNode.children || []
    const match = ch.find(c => c.name.toLowerCase().includes(term.toLowerCase()))
    if (match) drillInto(match)
  }, [currentNode, drillInto])

  // Keyboard shortcut — Ctrl/Cmd+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
        setTimeout(() => searchInputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') {
        setShowSearch(false)
        setSearchQuery('')
        setSearchResults([])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!mounted) return <div className="w-screen h-screen bg-[#0a1424]" />
  const isTreeView = depth === 0
  const branches = isTreeView ? BRANCH_DATA : (currentNode.children || [])
  const roots = isTreeView ? ROOT_DATA : []
  const hasWiki = wikiNode !== null

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a1424] relative" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Tree canvas */}
      <div className={`fixed top-0 left-0 h-full transition-all duration-300 ${hasWiki ? 'w-[calc(100%-380px)]' : 'w-full'}`}>
        <TreeCanvas branches={branches} roots={roots} isTreeView={isTreeView} currentNode={currentNode}
          navStack={navStack} onDrillInto={drillInto} onHoverNode={() => {}} isGenerating={isGenerating}
          loadingNode={loadingNode} exploredNodes={new Set()} depth={depth} />
      </div>

      {/* UI Overlay */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 pointer-events-auto" style={{ paddingRight: hasWiki ? '380px' : '0' }}>
          {/* Title centered */}
          <div className="text-center pt-3 pb-1">
            <h1 className="text-lg md:text-xl font-bold text-[#f0ece4] drop-shadow-lg" style={{ fontFamily: "'Lora', serif" }}>The Tree of Knowledge</h1>
            <p className="text-[8px] text-[#6a7a8a] tracking-[3px] uppercase font-semibold">Infinite depth · AI-powered</p>
          </div>

          {/* Search button — directly above the breadcrumb, left-aligned */}
          <div className="px-4 pt-1 pb-0.5 flex items-center gap-2">
            <button onClick={() => { setShowSearch(true); setTimeout(() => searchInputRef.current?.focus(), 50) }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/5 text-[#8a9aaa] text-[11px] font-semibold hover:text-[#f0d888] hover:bg-black/40 transition-all">
              <span className="text-[12px]">⌕</span> Search
            </button>
            {depth > 0 && (
              <button onClick={goBack}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/5 text-[#8a9aaa] text-[11px] font-semibold hover:text-[#f0d888] hover:bg-black/40 transition-all">
                <span className="text-[12px]">‹</span> Back
              </button>
            )}
          </div>

          {/* Breadcrumb — directly below search */}
          <div className="px-4 pb-2 flex items-center gap-1 flex-wrap">
            {navStack.map((node, i) => (
              <div key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-[9px] text-white/15">›</span>}
                <button onClick={() => navigateTo(i)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all backdrop-blur-sm
                    ${i === navStack.length - 1 ? 'text-[#f0d888] bg-[#f0d888]/10' : 'text-white/45 bg-black/25 hover:text-white hover:bg-white/8'}`}>
                  {i === 0 ? '🌳 Tree' : node.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Subtle stats bottom-left */}
        <div className="absolute bottom-3 left-4">
          <div className="text-[10px] text-white/10 tracking-widest uppercase font-bold">{totalNodes} topics · <span className="text-[#f0d888]/20">∞ to discover</span></div>
        </div>
      </div>

      {/* Search Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]) }} />
          <div className="relative w-full max-w-lg mx-4">
            {/* Search input */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">⌕</span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search any topic — art, quantum physics, philosophy..."
                className="w-full pl-12 pr-12 py-4 bg-[#12121a] border border-white/10 rounded-2xl text-[#f0ece4] text-[15px] font-medium outline-none focus:border-[#d4a853]/30 transition-all placeholder:text-white/20"
                style={{ fontFamily: "'Nunito', sans-serif" }}
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); searchInputRef.current?.focus() }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 text-sm transition-colors">
                  ✕
                </button>
              )}
            </div>

            {/* Hint */}
            {!searchQuery && (
              <div className="text-center mt-3 text-[11px] text-white/15">
                Type to search across all knowledge domains
              </div>
            )}

            {/* Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-[#12121a] border border-white/8 rounded-2xl overflow-hidden max-h-[50vh] overflow-y-auto">
                {searchResults.map((result, i) => {
                  const pathNames = result.path.slice(1, -1).map(n => n.name)
                  return (
                    <button key={i} onClick={() => jumpToNode(result)}
                      className="w-full text-left px-5 py-3.5 border-b border-white/[0.03] last:border-b-0 hover:bg-white/[0.03] transition-colors group">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[14px] text-[#f0ece4] font-semibold group-hover:text-[#f0d888] transition-colors">
                            {result.node.icon && <span className="mr-1.5">{result.node.icon}</span>}
                            {result.node.name}
                          </div>
                          {result.node.desc && (
                            <div className="text-[11px] text-white/25 mt-0.5 line-clamp-1">{result.node.desc}</div>
                          )}
                          {pathNames.length > 0 && (
                            <div className="text-[10px] text-white/12 mt-1 flex items-center gap-1 flex-wrap">
                              {pathNames.map((name, j) => (
                                <span key={j} className="flex items-center gap-1">
                                  {j > 0 && <span className="text-white/8">›</span>}
                                  <span>{name}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-white/10 text-[11px] group-hover:text-white/25 transition-colors ml-3">→</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* No results */}
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="mt-2 bg-[#12121a] border border-white/8 rounded-2xl px-5 py-6 text-center">
                <div className="text-[13px] text-white/25 mb-1">No matching topics found yet</div>
                <div className="text-[11px] text-white/15">Try browsing the tree — AI generates new branches as you explore deeper</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wiki Panel */}
      {hasWiki && (
        <WikiPanel
          node={wikiNode!}
          content={wikiContent}
          loading={wikiLoading}
          isBookmarked={false}
          onBookmark={() => {}}
          onDrillInto={drillInto}
          onWikiLink={handleWikiLink}
          onClose={() => { setWikiNode(null); setWikiContent(null) }}
          depth={depth}
          currentChildren={currentNode.children || []}
        />
      )}
    </div>
  )
}
