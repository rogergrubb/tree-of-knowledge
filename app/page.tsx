"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { TreeCanvas } from './components/TreeCanvas'
import { WikiPanel } from './components/WikiPanel'
import { Sidebar } from './components/Sidebar'
import { DepthChallenge } from './components/DepthChallenge'
import { KnowledgeNode, generateSubtopics, generateArticle } from './lib/ai'
import { SEED_TREE, ROOT_DATA, BRANCH_DATA } from './data/seedTree'
import { loadProgress, saveProgress, loadExploredNodes, saveExploredNode, loadBookmarks, saveBookmark, removeBookmark } from './lib/storage'

interface UserProgress { nodesExplored: number; deepestLevel: number; lastExplored: string; sessions: number }
function countAll(n: KnowledgeNode): number { let c = 1; if (n.children) n.children.forEach(ch => c += countAll(ch)); return c }

export default function Home() {
  const [navStack, setNavStack] = useState<KnowledgeNode[]>([SEED_TREE])
  const [currentNode, setCurrentNode] = useState<KnowledgeNode>(SEED_TREE)
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [wikiContent, setWikiContent] = useState<string | null>(null)
  const [wikiLoading, setWikiLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showDepthChallenge, setShowDepthChallenge] = useState(false)
  const [progress, setProgress] = useState<UserProgress>({ nodesExplored: 0, deepestLevel: 0, lastExplored: '', sessions: 1 })
  const [exploredNodes, setExploredNodes] = useState<Set<string>>(new Set())
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [totalNodes, setTotalNodes] = useState(0)
  const [deepestLevel, setDeepestLevel] = useState(0)
  const [mounted, setMounted] = useState(false)
  const generatingRef = useRef(false)

  useEffect(() => { setMounted(true); setProgress(loadProgress()); setExploredNodes(new Set(loadExploredNodes())); setBookmarks(loadBookmarks()) }, [])
  useEffect(() => { setTotalNodes(countAll(SEED_TREE)) }, [currentNode])
  const depth = navStack.length - 1
  useEffect(() => { if (depth > deepestLevel) { setDeepestLevel(depth); const p = { ...progress, deepestLevel: depth, lastExplored: new Date().toISOString() }; setProgress(p); saveProgress(p) } }, [depth])

  const markExplored = useCallback((name: string) => {
    if (!exploredNodes.has(name)) { const s = new Set(exploredNodes); s.add(name); setExploredNodes(s); saveExploredNode(name); const p = { ...progress, nodesExplored: s.size, lastExplored: new Date().toISOString() }; setProgress(p); saveProgress(p) }
  }, [exploredNodes, progress])

  const drillInto = useCallback(async (node: KnowledgeNode) => {
    markExplored(node.name)
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
    setNavStack([...navStack, node]); setCurrentNode(node); setSelectedNode(null); setWikiContent(null)
    const nd = navStack.length; if (nd === 4 || nd === 7 || nd === 10) setShowDepthChallenge(true)
  }, [navStack, markExplored])

  const navigateTo = useCallback((i: number) => { const s = navStack.slice(0, i + 1); setNavStack(s); setCurrentNode(s[i]); setSelectedNode(null); setWikiContent(null) }, [navStack])

  const selectNode = useCallback(async (node: KnowledgeNode | null) => {
    setSelectedNode(node)
    if (node?.desc) { setWikiContent(null); setWikiLoading(true); try { setWikiContent(await generateArticle(node.name, node.desc, [...navStack.map(n => n.name), node.name])) } catch { setWikiContent(null) } finally { setWikiLoading(false) } }
    else setWikiContent(null)
  }, [navStack])

  const handleWikiLink = useCallback((term: string) => { const match = (currentNode.children || []).find(c => c.name.toLowerCase().includes(term.toLowerCase())); if (match) drillInto(match) }, [currentNode, drillInto])
  const toggleBookmark = useCallback((name: string) => { if (bookmarks.includes(name)) { setBookmarks(bookmarks.filter(b => b !== name)); removeBookmark(name) } else { setBookmarks([...bookmarks, name]); saveBookmark(name) } }, [bookmarks])

  if (!mounted) return <div className="w-screen h-screen bg-[#0a1424]" />
  const isTreeView = depth === 0
  const branches = isTreeView ? BRANCH_DATA : (currentNode.children || [])
  const roots = isTreeView ? ROOT_DATA : []

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a1424] relative" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <TreeCanvas branches={branches} roots={roots} isTreeView={isTreeView} currentNode={currentNode} navStack={navStack} onDrillInto={drillInto} onHoverNode={selectNode} isGenerating={isGenerating} exploredNodes={exploredNodes} depth={depth} />
      <div className="fixed inset-0 pointer-events-none z-10">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-xl md:text-2xl font-bold text-[#f0ece4] drop-shadow-lg" style={{ fontFamily: "'Lora', serif" }}>The Tree of Knowledge</h1>
          <p className="text-[9px] text-[#6a7a8a] tracking-[3px] uppercase font-semibold mt-0.5">Infinite depth · AI-powered · Every branch of understanding</p>
        </div>
        <div className="absolute top-14 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-auto flex-wrap justify-center max-w-[90%]">
          {navStack.map((node, i) => (<div key={i} className="flex items-center gap-1">{i > 0 && <span className="text-[9px] text-white/15">›</span>}<button onClick={() => navigateTo(i)} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all backdrop-blur-sm ${i === navStack.length - 1 ? 'text-[#f0d888] bg-[#f0d888]/10' : 'text-white/45 bg-black/25 hover:text-white hover:bg-white/8'}`}>{i === 0 ? '🌳 Tree' : node.name}</button></div>))}
        </div>
        <div className="absolute bottom-3 right-4 text-right"><div className="text-[10px] text-white/10 tracking-widest uppercase font-bold">{totalNodes} topics · <span className="text-[#f0d888]/30">∞ to discover</span></div><div className="text-[9px] text-white/8 tracking-wider mt-0.5">Depth {depth} · {exploredNodes.size} visited</div></div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ writingMode: 'vertical-rl' as any }}><span className="text-[9px] tracking-[5px] uppercase text-white/8 font-extrabold">{['CANOPY','BRANCH','LIMB','TWIG','LEAF','VEIN','CELL','MOLECULE','ATOM'][Math.min(depth,8)]}</span></div>
        <button onClick={() => setShowSidebar(!showSidebar)} className="absolute top-3 left-3 pointer-events-auto p-2 rounded-lg bg-black/30 backdrop-blur-sm border border-white/5 text-white/50 hover:text-white/80 transition-all text-sm">☰</button>
        {depth > 0 && <button onClick={() => navigateTo(depth - 1)} className="absolute bottom-4 left-4 pointer-events-auto px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/5 text-[#8a9aaa] text-[11px] font-semibold hover:text-[#f0d888] transition-all">← Back</button>}
        {isGenerating && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><div className="bg-black/60 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/5 text-center"><div className="text-lg mb-2 animate-pulse">🌱</div><div className="text-[13px] text-[#f0ece4] font-semibold">Growing new branches...</div><div className="text-[10px] text-white/30 mt-1">AI is discovering deeper knowledge</div></div></div>}
      </div>
      {selectedNode && <WikiPanel node={selectedNode} content={wikiContent} loading={wikiLoading} isBookmarked={bookmarks.includes(selectedNode.name)} onBookmark={() => toggleBookmark(selectedNode.name)} onDrillInto={drillInto} onWikiLink={handleWikiLink} onClose={() => { setSelectedNode(null); setWikiContent(null) }} depth={depth} currentChildren={currentNode.children || []} />}
      {showSidebar && <Sidebar progress={progress} exploredNodes={exploredNodes} bookmarks={bookmarks} deepestLevel={deepestLevel} totalNodes={totalNodes} onClose={() => setShowSidebar(false)} onNavigateBookmark={() => setShowSidebar(false)} />}
      {showDepthChallenge && <DepthChallenge depth={depth} nodesExplored={exploredNodes.size} onClose={() => setShowDepthChallenge(false)} onKeepGoing={() => setShowDepthChallenge(false)} />}
    </div>
  )
}
