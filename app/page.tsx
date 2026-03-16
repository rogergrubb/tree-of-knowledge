"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { TreeCanvas } from './components/TreeCanvas'
import { WikiPanel } from './components/WikiPanel'
import { HistoryPanel, useHistory, HistoryItem } from './components/HistoryPanel'
import { ResizeHandle, usePanelWidth } from './components/ResizeHandle'
import SidebarButtons from './components/SidebarButtons'
import { KnowledgeNode, generateSubtopics, generateArticle, searchKnowledge } from './lib/ai'
import { SEED_TREE, ROOT_DATA, BRANCH_DATA } from './data/seedTree'

function countAll(n: KnowledgeNode): number { let c = 1; if (n.children) n.children.forEach(ch => c += countAll(ch)); return c }

function flattenTree(node: KnowledgeNode, path: KnowledgeNode[] = [], results: { node: KnowledgeNode, path: KnowledgeNode[] }[] = []) {
  const currentPath = [...path, node]
  results.push({ node, path: currentPath })
  if (node.children) node.children.forEach(ch => flattenTree(ch, currentPath, results))
  return results
}

// Find or create a node at a given path in the tree
function findOrCreatePath(tree: KnowledgeNode, pathNames: string[], desc?: string, icon?: string): KnowledgeNode[] {
  const result: KnowledgeNode[] = [tree]
  let current = tree

  for (let i = 0; i < pathNames.length; i++) {
    const name = pathNames[i]
    if (!current.children) current.children = []

    // Try to find existing child (fuzzy match)
    let child = current.children.find(c =>
      c.name.toLowerCase() === name.toLowerCase() ||
      c.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(c.name.toLowerCase())
    )

    if (!child) {
      // Create the node
      const isLast = i === pathNames.length - 1
      child = {
        name,
        desc: isLast ? desc : `A branch of ${current.name}`,
        icon: isLast ? icon : undefined,
        _aiGenerated: true
      }
      // Inherit hue from parent
      if (current.hue !== undefined) child.hue = current.hue
      if (current.sat !== undefined) child.sat = current.sat
      current.children.push(child)
    }

    result.push(child)
    current = child
  }

  return result
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

  // History hook
  const { history, addToHistory, deleteItems, clearHistory } = useHistory()

  // Panel widths (resizable)
  const { width: leftWidth, setWidth: setLeftWidth } = usePanelWidth('tok_left_width', 280, 200, 450)
  const { width: rightWidth, setWidth: setRightWidth } = usePanelWidth('tok_right_width', 380, 300, 600)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ node: KnowledgeNode, path: KnowledgeNode[] }[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
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
    
    // Add to history
    addToHistory(node.name, newStack.map(n => n.name), node.icon)
  }, [navStack, loadArticle, addToHistory])

  const navigateTo = useCallback(async (i: number) => {
    const s = navStack.slice(0, i + 1)
    const target = s[i]
    setNavStack(s)
    setCurrentNode(target)

    if (i === 0) {
      setWikiNode(null); setWikiContent(null)
      return
    }

    loadArticle(target, s.map(n => n.name))
    
    // Add to history
    addToHistory(target.name, s.map(n => n.name), target.icon)

    // If this node has no children (created as a pass-through by search), generate them
    if (!target.children || target.children.length === 0) {
      if (generatingRef.current) return
      generatingRef.current = true; setIsGenerating(true); setLoadingNode(target)
      try {
        const path = s.map(n => n.name)
        target.children = await generateSubtopics(target.name, target.desc || '', path)
        target._aiGenerated = true
        setTotalNodes(countAll(SEED_TREE))
        // Force re-render by updating currentNode reference
        setCurrentNode({ ...target })
      }
      catch { target.children = [{ name: 'Try again', desc: 'AI temporarily unavailable', icon: '⚠️' }] }
      finally { setIsGenerating(false); generatingRef.current = false; setLoadingNode(null) }
    }
  }, [navStack, loadArticle, addToHistory])

  const goBack = useCallback(() => { if (depth > 0) navigateTo(depth - 1) }, [depth, navigateTo])

  // Navigate from history
  const navigateFromHistory = useCallback(async (pathNames: string[]) => {
    // Build the path from names
    const nodePath = findOrCreatePath(SEED_TREE, pathNames.slice(1)) // Skip "All Knowledge"
    setTotalNodes(countAll(SEED_TREE))
    
    const targetNode = nodePath[nodePath.length - 1]
    setNavStack(nodePath)
    setCurrentNode(targetNode)
    
    if (nodePath.length > 1) {
      loadArticle(targetNode, nodePath.map(n => n.name))
    } else {
      setWikiNode(null)
      setWikiContent(null)
    }
  }, [loadArticle])

  // Jump to a local search result
  const jumpToNode = useCallback((result: { node: KnowledgeNode, path: KnowledgeNode[] }) => {
    setNavStack(result.path)
    setCurrentNode(result.node)
    setSearchQuery(''); setSearchResults([]); setShowSearch(false)
    
    // Add to history
    addToHistory(result.node.name, result.path.map(n => n.name), result.node.icon)
    
    if (result.path.length > 1) loadArticle(result.node, result.path.map(n => n.name))
    else { setWikiNode(null); setWikiContent(null) }
  }, [loadArticle, addToHistory])

  // AI search — type anything, AI resolves it
  const doAISearch = useCallback(async (query: string) => {
    setSearchLoading(true)
    try {
      const result = await searchKnowledge(query)
      if (result && result.path && result.path.length > 0) {
        // Build/find the path in the actual tree
        const nodePath = findOrCreatePath(SEED_TREE, result.path, result.desc, result.icon)
        setTotalNodes(countAll(SEED_TREE))

        // Navigate there
        const targetNode = nodePath[nodePath.length - 1]
        setNavStack(nodePath)
        setCurrentNode(targetNode)
        setSearchQuery(''); setSearchResults([]); setShowSearch(false)
        loadArticle(targetNode, nodePath.map(n => n.name))
        
        // Add to history
        addToHistory(targetNode.name, nodePath.map(n => n.name), targetNode.icon)
      }
    } catch (err) {
      console.error('AI search failed:', err)
    } finally {
      setSearchLoading(false)
    }
  }, [loadArticle, addToHistory])

  // Local search with debounce
  const handleSearchInput = useCallback((query: string) => {
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
      ).slice(0, 8)
      setSearchResults(matches)
    }, 150)
  }, [])

  // Submit search — Enter key triggers AI search
  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim().length >= 2) doAISearch(searchQuery.trim())
  }, [searchQuery, doAISearch])

  const handleWikiLink = useCallback((term: string) => {
    const ch = currentNode.children || []
    const match = ch.find(c => c.name.toLowerCase().includes(term.toLowerCase()))
    if (match) drillInto(match)
  }, [currentNode, drillInto])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true); setTimeout(() => searchInputRef.current?.focus(), 50) }
      if (e.key === 'Escape') { setShowSearch(false); setSearchQuery(''); setSearchResults([]) }
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
      <div 
        className="fixed top-0 h-full transition-all duration-150"
        style={{ 
          left: 0,
          width: hasWiki ? `calc(100% - ${rightWidth}px)` : '100%'
        }}
      >
        <TreeCanvas branches={branches} roots={roots} isTreeView={isTreeView} currentNode={currentNode}
          navStack={navStack} onDrillInto={drillInto} onHoverNode={() => {}} isGenerating={isGenerating}
          loadingNode={loadingNode} exploredNodes={new Set()} depth={depth} />
      </div>

      {/* Left Sidebar - Full Height */}
      <div 
        className="fixed top-0 left-0 h-screen flex flex-col z-10 bg-[#0a0e18]/95 border-r border-white/[0.06]"
        style={{ width: leftWidth }}
      >
        {/* Resize Handle */}
        <ResizeHandle 
          side="left" 
          width={leftWidth} 
          minWidth={200} 
          maxWidth={450} 
          onResize={setLeftWidth} 
        />
        
        {/* Header - Fixed */}
        <div className="flex-shrink-0">
          {/* Title */}
          <div className="text-center pt-4 pb-2">
            <h1 className="text-lg md:text-xl font-bold text-[#f0ece4] drop-shadow-lg" style={{ fontFamily: "'Lora', serif" }}>The Tree of Knowledge</h1>
            <p className="text-[8px] text-[#6a7a8a] tracking-[3px] uppercase font-semibold">Infinite depth · AI-powered</p>
          </div>

          {/* Search + Back buttons */}
          <div className="px-4 pt-1 pb-1 flex items-center gap-2">
            <button onClick={() => { setShowSearch(true); setTimeout(() => searchInputRef.current?.focus(), 50) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[#8a9aaa] text-[11px] font-semibold hover:text-[#f0d888] hover:bg-white/[0.08] transition-all">
              <span className="text-[12px]">⌕</span> Search anything
            </button>
            {depth > 0 && (
              <button onClick={goBack}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[#8a9aaa] text-[11px] font-semibold hover:text-[#f0d888] hover:bg-white/[0.08] transition-all">
                <span className="text-[12px]">‹</span> Back
              </button>
            )}
          </div>

          {/* Breadcrumb */}
          <div className="px-4 py-2 flex items-center gap-1 flex-wrap border-b border-white/[0.04]">
            {navStack.map((node, i) => (
              <div key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-[9px] text-white/15">›</span>}
                <button onClick={() => navigateTo(i)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all
                    ${i === navStack.length - 1 ? 'text-[#f0d888] bg-[#f0d888]/10' : 'text-white/45 bg-white/[0.04] hover:text-white hover:bg-white/[0.08]'}`}>
                  {i === 0 ? '🌳 Tree' : node.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Content - History */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <HistoryPanel 
            history={history}
            onNavigate={navigateFromHistory} 
            onDelete={deleteItems}
            onClear={clearHistory}
            currentPath={navStack.map(n => n.name)} 
          />
        </div>

        {/* Footer - Fixed at Bottom */}
        <div className="flex-shrink-0 border-t border-white/[0.06] p-3">
          {/* Stats */}
          <div className="text-[10px] text-white/20 tracking-wider uppercase font-semibold mb-3 text-center">
            {totalNodes} topics · <span className="text-[#f0d888]/30">∞ to discover</span>
          </div>
          
          {/* Support & Music Buttons */}
          <SidebarButtons />
        </div>
      </div>

      {/* ════ SEARCH OVERLAY ════ */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]) }} />
          <div className="relative w-full max-w-lg mx-4">
            {/* Search input */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">⌕</span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit() }}
                placeholder="Search anything — plubicon tube, dark matter, baroque art..."
                className="w-full pl-12 pr-24 py-4 bg-[#12121a] border border-white/10 rounded-2xl text-[#f0ece4] text-[15px] font-medium outline-none focus:border-[#d4a853]/30 transition-all placeholder:text-white/20"
                style={{ fontFamily: "'Nunito', sans-serif" }}
                autoFocus
              />
              {/* Go button for AI search */}
              {searchQuery.trim().length >= 2 && (
                <button onClick={handleSearchSubmit}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#d4a853]/15 border border-[#d4a853]/20 text-[#f0d888] text-[11px] font-bold hover:bg-[#d4a853]/25 transition-all">
                  {searchLoading ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"/><path d="M12 2 a10 10 0 0 1 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      Finding...
                    </span>
                  ) : 'AI Search ↵'}
                </button>
              )}
            </div>

            {/* Hint */}
            {!searchQuery && (
              <div className="text-center mt-3 text-[11px] text-white/15">
                Type anything and press Enter — AI will find it in the tree of knowledge
              </div>
            )}

            {/* Loading state for AI search */}
            {searchLoading && (
              <div className="mt-3 bg-[#12121a] border border-white/8 rounded-2xl px-5 py-6 text-center">
                <div className="relative w-10 h-10 mx-auto mb-3">
                  <svg className="w-10 h-10 animate-spin" style={{ animationDuration: '2s' }} viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(212,168,83,0.12)" strokeWidth="2" />
                    <path d="M20 4 a16 16 0 0 1 16 16" fill="none" stroke="#d4a853" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-[13px] text-white/30 font-medium">AI is locating this in the tree of knowledge...</div>
                <div className="text-[10px] text-white/15 mt-1">Figuring out where "{searchQuery}" belongs</div>
              </div>
            )}

            {/* Local results */}
            {!searchLoading && searchResults.length > 0 && (
              <div className="mt-2 bg-[#12121a] border border-white/8 rounded-2xl overflow-hidden max-h-[45vh] overflow-y-auto">
                {searchResults.map((result, i) => {
                  const pathNames = result.path.slice(1, -1).map(n => n.name)
                  return (
                    <button key={i} onClick={() => jumpToNode(result)}
                      className="w-full text-left px-5 py-3 border-b border-white/[0.03] last:border-b-0 hover:bg-white/[0.03] transition-colors group">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[14px] text-[#f0ece4] font-semibold group-hover:text-[#f0d888] transition-colors">
                            {result.node.icon && <span className="mr-1.5">{result.node.icon}</span>}
                            {result.node.name}
                          </div>
                          {result.node.desc && <div className="text-[11px] text-white/25 mt-0.5 line-clamp-1">{result.node.desc}</div>}
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

                {/* AI search prompt at bottom of local results */}
                <button onClick={handleSearchSubmit}
                  className="w-full text-left px-5 py-3 hover:bg-[#d4a853]/[0.04] transition-colors border-t border-white/[0.04] group">
                  <div className="text-[12px] text-[#d4a853]/60 group-hover:text-[#d4a853] transition-colors font-medium">
                    ⌕ Not what you are looking for? Press Enter for AI-powered search
                  </div>
                </button>
              </div>
            )}

            {/* No local results — prompt AI search */}
            {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="mt-2 bg-[#12121a] border border-white/8 rounded-2xl px-5 py-5 text-center">
                <div className="text-[13px] text-white/25 mb-2">No exact match in the current tree</div>
                <button onClick={handleSearchSubmit}
                  className="px-4 py-2 rounded-xl bg-[#d4a853]/10 border border-[#d4a853]/20 text-[#f0d888] text-[12px] font-semibold hover:bg-[#d4a853]/20 transition-all">
                  ⌕ Let AI find "{searchQuery}" in all of human knowledge
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wiki Panel (Resizable) */}
      {hasWiki && (
        <div 
          className="fixed top-0 right-0 h-full z-20"
          style={{ width: rightWidth }}
        >
          {/* Resize Handle */}
          <ResizeHandle 
            side="right" 
            width={rightWidth} 
            minWidth={300} 
            maxWidth={600} 
            onResize={setRightWidth} 
          />
          <WikiPanel node={wikiNode!} content={wikiContent} loading={wikiLoading}
            isBookmarked={false} isGenerating={isGenerating} onBookmark={() => {}} onDrillInto={drillInto} onWikiLink={handleWikiLink}
            onClose={() => { setWikiNode(null); setWikiContent(null) }}
            depth={depth} currentChildren={currentNode.children || []} 
            width={rightWidth}
          />
        </div>
      )}


    </div>
  )
}

