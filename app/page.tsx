"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { TreeCanvas } from './components/TreeCanvas'
import { WikiPanel } from './components/WikiPanel'
import { KnowledgeNode, generateSubtopics, generateArticle } from './lib/ai'
import { SEED_TREE, ROOT_DATA, BRANCH_DATA } from './data/seedTree'

function countAll(n: KnowledgeNode): number { let c = 1; if (n.children) n.children.forEach(ch => c += countAll(ch)); return c }

export default function Home() {
  const [navStack, setNavStack] = useState<KnowledgeNode[]>([SEED_TREE])
  const [currentNode, setCurrentNode] = useState<KnowledgeNode>(SEED_TREE)
  const [wikiNode, setWikiNode] = useState<KnowledgeNode | null>(null)
  const [wikiContent, setWikiContent] = useState<string | null>(null)
  const [wikiLoading, setWikiLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [totalNodes, setTotalNodes] = useState(0)
  const [mounted, setMounted] = useState(false)
  const generatingRef = useRef(false)
  const wikiAbortRef = useRef<AbortController | null>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setTotalNodes(countAll(SEED_TREE)) }, [currentNode])
  const depth = navStack.length - 1

  // Load wiki article for a node
  const loadArticle = useCallback(async (node: KnowledgeNode, path: string[]) => {
    // Cancel any in-flight article request
    if (wikiAbortRef.current) wikiAbortRef.current.abort()
    const controller = new AbortController()
    wikiAbortRef.current = controller

    setWikiNode(node)
    setWikiContent(null)
    setWikiLoading(true)
    try {
      const article = await generateArticle(node.name, node.desc || '', path)
      if (!controller.signal.aborted) {
        setWikiContent(article)
      }
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
      generatingRef.current = true; setIsGenerating(true)
      try {
        const path = [...navStack.map(n => n.name), node.name]
        node.children = await generateSubtopics(node.name, node.desc || '', path)
        node._aiGenerated = true
        setTotalNodes(countAll(SEED_TREE))
      }
      catch { node.children = [{ name: 'Try again', desc: 'AI temporarily unavailable', icon: '⚠️' }] }
      finally { setIsGenerating(false); generatingRef.current = false }
    }

    const newStack = [...navStack, node]
    setNavStack(newStack)
    setCurrentNode(node)

    // Load article for the node we just drilled into
    loadArticle(node, newStack.map(n => n.name))
  }, [navStack, loadArticle])

  // Navigate back via breadcrumb
  const navigateTo = useCallback((i: number) => {
    const s = navStack.slice(0, i + 1)
    setNavStack(s)
    setCurrentNode(s[i])

    // If going back to root, close the wiki panel
    if (i === 0) {
      setWikiNode(null)
      setWikiContent(null)
    } else {
      // Show article for the node we navigated to
      loadArticle(s[i], s.map(n => n.name))
    }
  }, [navStack, loadArticle])

  // Handle clicking a [[linked term]] in the wiki article
  const handleWikiLink = useCallback((term: string) => {
    const ch = currentNode.children || []
    const match = ch.find(c => c.name.toLowerCase().includes(term.toLowerCase()))
    if (match) drillInto(match)
  }, [currentNode, drillInto])

  if (!mounted) return <div className="w-screen h-screen bg-[#0a1424]" />
  const isTreeView = depth === 0
  const branches = isTreeView ? BRANCH_DATA : (currentNode.children || [])
  const roots = isTreeView ? ROOT_DATA : []
  const hasWiki = wikiNode !== null

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a1424] relative" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Tree canvas — shrinks when wiki panel is open */}
      <div className={`fixed top-0 left-0 h-full transition-all duration-300 ${hasWiki ? 'w-[calc(100%-380px)]' : 'w-full'}`}>
        <TreeCanvas branches={branches} roots={roots} isTreeView={isTreeView} currentNode={currentNode}
          navStack={navStack} onDrillInto={drillInto} onHoverNode={() => {}} isGenerating={isGenerating}
          exploredNodes={new Set()} depth={depth} />
      </div>

      {/* UI Overlay */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {/* Title */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-center" style={{ marginLeft: hasWiki ? '-190px' : '0' }}>
          <h1 className="text-xl md:text-2xl font-bold text-[#f0ece4] drop-shadow-lg" style={{ fontFamily: "'Lora', serif" }}>The Tree of Knowledge</h1>
          <p className="text-[9px] text-[#6a7a8a] tracking-[3px] uppercase font-semibold mt-0.5">Infinite depth · AI-powered · Every branch of understanding</p>
        </div>

        {/* Breadcrumb */}
        <div className="absolute top-14 left-4 flex items-center gap-1 pointer-events-auto flex-wrap max-w-[60%]">
          {navStack.map((node, i) => (<div key={i} className="flex items-center gap-1">{i > 0 && <span className="text-[9px] text-white/15">›</span>}<button onClick={() => navigateTo(i)} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all backdrop-blur-sm ${i === navStack.length - 1 ? 'text-[#f0d888] bg-[#f0d888]/10' : 'text-white/45 bg-black/25 hover:text-white hover:bg-white/8'}`}>{i === 0 ? '🌳 Tree' : node.name}</button></div>))}
        </div>

        {/* Subtle stats */}
        <div className="absolute bottom-3 left-4 text-left">
          <div className="text-[10px] text-white/10 tracking-widest uppercase font-bold">{totalNodes} topics · <span className="text-[#f0d888]/20">∞ to discover</span></div>
        </div>

        {/* Back button */}
        {depth > 0 && <button onClick={() => navigateTo(depth - 1)} className="absolute bottom-4 right-[calc(380px+16px)] pointer-events-auto px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/5 text-[#8a9aaa] text-[11px] font-semibold hover:text-[#f0d888] transition-all" style={{ right: hasWiki ? 'calc(380px + 16px)' : '16px' }}>← Back</button>}

        {/* Generating indicator */}
        {isGenerating && (
          <div className="absolute top-1/2 -translate-y-1/2" style={{ left: hasWiki ? 'calc((100% - 380px) / 2)' : '50%', transform: 'translate(-50%, -50%)' }}>
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/5 text-center">
              <div className="text-lg mb-2 animate-pulse">🌱</div>
              <div className="text-[13px] text-[#f0ece4] font-semibold">Growing new branches...</div>
              <div className="text-[10px] text-white/30 mt-1">AI is discovering deeper knowledge</div>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Wiki Panel — stays open once you drill into a node */}
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
