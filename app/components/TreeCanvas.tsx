"use client"
import { useRef, useEffect, useCallback, useState } from 'react'
import { KnowledgeNode } from '../lib/ai'

interface TreeCanvasProps {
  branches: KnowledgeNode[]
  roots: KnowledgeNode[]
  isTreeView: boolean
  currentNode: KnowledgeNode
  navStack: KnowledgeNode[]
  onDrillInto: (node: KnowledgeNode) => void
  onHoverNode: (node: KnowledgeNode | null) => void
  isGenerating: boolean
  loadingNode: KnowledgeNode | null
  exploredNodes: Set<string>
  depth: number
}

function countN(n: KnowledgeNode): number {
  let c = 1; if (n.children) n.children.forEach(ch => c += countN(ch)); return c
}

function getHue(node: KnowledgeNode, navStack: KnowledgeNode[]): { h: number, s: number } {
  if (node.hue !== undefined) return { h: node.hue!, s: node.sat || 50 }
  for (let i = navStack.length - 1; i >= 0; i--) {
    if (navStack[i].hue !== undefined) return { h: navStack[i].hue!, s: navStack[i].sat || 50 }
  }
  return { h: 100, s: 45 }
}

export function TreeCanvas({
  branches, roots, isTreeView, currentNode, navStack,
  onDrillInto, onHoverNode, isGenerating, loadingNode, exploredNodes, depth
}: TreeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(0)
  const timeRef = useRef(0)
  const hoveredRef = useRef<KnowledgeNode | null>(null)
  const nodesRef = useRef<KnowledgeNode[]>([])
  const rootNodesRef = useRef<KnowledgeNode[]>([])

  const layout = useCallback(() => {
    const container = canvasRef.current?.parentElement
    const W = container ? container.clientWidth : window.innerWidth
    const H = container ? container.clientHeight : window.innerHeight
    const gY = H * 0.58, cx = W / 2
    const bNodes: KnowledgeNode[] = []
    const rNodes: KnowledgeNode[] = []

    if (isTreeView) {
      const trunkTopY = gY - H * 0.12
      const n = branches.length
      const angleSpan = Math.PI * 0.8
      branches.forEach((child, i) => {
        const w = Math.pow(countN(child), 0.38)
        const startA = Math.PI / 2 + angleSpan / 2
        const angle = n === 1 ? Math.PI / 2 : startA - (i / (n - 1)) * angleSpan
        const len = Math.min(H * 0.32, W * 0.32, 180) + w * 16
        child._x = cx + Math.cos(angle) * len
        child._y = trunkTopY - Math.sin(angle) * len
        child._r = Math.max(18, Math.min(34, w * 5.5))
        child._bx = cx; child._by = trunkTopY; child._type = 'branch'
        bNodes.push(child)
      })
      const rootTopY = gY + H * 0.04
      const rn = roots.length
      const rootSpan = Math.PI * 0.55
      roots.forEach((child, i) => {
        const w = Math.pow(countN(child), 0.38)
        const startA = Math.PI * 1.5 - rootSpan / 2
        const angle = rn === 1 ? Math.PI * 1.5 : startA + (i / (rn - 1)) * rootSpan
        const len = Math.min(H * 0.24, 130) + w * 10
        child._x = cx + Math.cos(angle) * len
        child._y = rootTopY - Math.sin(angle) * len
        child._r = Math.max(16, Math.min(28, w * 4.5))
        child._bx = cx; child._by = rootTopY; child._type = 'root'
        rNodes.push(child)
      })
    } else {
      const fanY = H * 0.45
      const n = branches.length
      
      if (n === 0) {
        // No children - show current node in center as a "seed" that can grow
        const centerNode = { ...currentNode }
        centerNode._x = cx
        centerNode._y = fanY
        centerNode._r = 40
        centerNode._bx = cx
        centerNode._by = fanY + 80
        centerNode._type = 'center'
        bNodes.push(centerNode)
      } else {
        const angleSpan = Math.PI * 0.82
        branches.forEach((child, i) => {
          const w = Math.pow(countN(child), 0.38)
          const startA = Math.PI / 2 + angleSpan / 2
          const angle = n === 1 ? Math.PI / 2 : startA - (i / (n - 1)) * angleSpan
          const len = Math.min(H * 0.3, W * 0.35, 200) + w * 14
          child._x = cx + Math.cos(angle) * len
          child._y = fanY - Math.sin(angle) * len
          child._r = Math.max(16, Math.min(32, w * 5))
          child._bx = cx; child._by = fanY; child._type = 'branch'
          bNodes.push(child)
        })
      }
    }
    nodesRef.current = bNodes
    rootNodesRef.current = rNodes
  }, [branches, roots, isTreeView, currentNode])

  useEffect(() => { layout() }, [layout])
  useEffect(() => { const onR = () => layout(); window.addEventListener('resize', onR); return () => window.removeEventListener('resize', onR) }, [layout])
  
  // ResizeObserver to detect container size changes (when panels resize)
  // Using a ref to track last known dimensions and only re-layout when they actually change
  const lastDimsRef = useRef({ w: 0, h: 0 })
  useEffect(() => {
    const container = canvasRef.current?.parentElement
    if (!container) return
    
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      // Only relayout if dimensions actually changed
      if (width !== lastDimsRef.current.w || height !== lastDimsRef.current.h) {
        lastDimsRef.current = { w: width, h: height }
        layout()
      }
    })
    
    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [layout])

  // Stars data
  const starsRef = useRef(Array.from({ length: 150 }, () => ({
    x: Math.random(), y: Math.random() * 0.55, s: Math.random() * 1 + 0.3,
    b: Math.random() * 0.3 + 0.06, sp: Math.random() * 2 + 0.5, ph: Math.random() * Math.PI * 2
  })))

  // Leaves
  const leavesRef = useRef(Array.from({ length: 15 }, () => ({
    x: Math.random() * 2000, y: Math.random() * 800,
    sz: Math.random() * 2.5 + 1, spd: Math.random() * 0.2 + 0.06,
    dr: Math.random() * 0.3 - 0.15, hue: Math.random() * 60 + 80,
    op: Math.random() * 0.1 + 0.03, ph: Math.random() * Math.PI * 2
  })))

  // Draw
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    if (!c) return
    const container = canvas.parentElement
    const W = container ? container.clientWidth : window.innerWidth
    const H = container ? container.clientHeight : window.innerHeight
    const dpr = Math.min(devicePixelRatio, 2)
    canvas.width = W * dpr; canvas.height = H * dpr
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px'
    c.setTransform(dpr, 0, 0, dpr, 0, 0)

    if (W <= 0 || H <= 0) return
    const t = timeRef.current
    const gY = H * 0.58
    const centerX = W / 2

    // Sky
    const gR = Math.max(0.4, Math.min(0.85, gY / H))
    const sky = c.createLinearGradient(0, 0, 0, H)
    sky.addColorStop(0, '#08101e'); sky.addColorStop(0.2, '#142840')
    sky.addColorStop(gR * 0.75, '#3a6888'); sky.addColorStop(gR - 0.03, '#7aA8c0')
    sky.addColorStop(gR, '#b0a070')
    sky.addColorStop(gR + 0.008, '#3a2e1a')
    sky.addColorStop(Math.min(gR + 0.12, 0.97), '#2a1e0e')
    sky.addColorStop(1, '#1a1208')
    c.fillStyle = sky; c.fillRect(0, 0, W, H)

    // Stars
    starsRef.current.forEach(s => {
      const tw = Math.sin(t * s.sp + s.ph) * 0.3 + 0.7
      c.globalAlpha = s.b * tw; c.fillStyle = '#ccd8ee'
      c.beginPath(); c.arc(s.x * W, s.y * H, s.s, 0, Math.PI * 2); c.fill()
    })
    c.globalAlpha = 1

    // Underground texture
    c.globalAlpha = 0.12
    for (let i = 0; i < 5; i++) {
      const ly = gY + 10 + i * ((H - gY) / 5)
      c.strokeStyle = `hsl(25,30%,${18 - i * 2}%)`; c.lineWidth = 0.5
      c.beginPath(); c.moveTo(0, ly)
      for (let x = 0; x < W; x += 20) c.lineTo(x, ly + Math.sin(x * 0.02 + i * 2) * 4)
      c.stroke()
    }
    c.globalAlpha = 1

    // Grass
    for (let i = 0; i < 60; i++) {
      const gx = (i / 60) * W + Math.sin(i * 3.7) * 15
      c.globalAlpha = 0.22
      c.strokeStyle = `hsl(${90 + Math.sin(i) * 15},38%,${32 + Math.sin(i * 2) * 8}%)`
      c.lineWidth = 1.2; c.beginPath(); c.moveTo(gx, gY - 2)
      c.quadraticCurveTo(gx + Math.sin(t + i) * 2, gY - 12, gx + Math.sin(t * 0.5 + i) * 4, gY - 18)
      c.stroke()
    }
    c.globalAlpha = 1

    // Foundations label
    if (isTreeView) {
      c.globalAlpha = 0.12; c.font = '600 10px Nunito,sans-serif'; c.textAlign = 'center'
      c.fillStyle = '#a09070'
      c.fillText('  F O U N D A T I O N S  ', centerX, gY + 14)
      c.globalAlpha = 1
    }

    // Trunk (tree view only)
    if (isTreeView) {
      const trunkTopY = gY - H * 0.12
      const tw = Math.min(22, W * 0.025)
      const bark = c.createLinearGradient(centerX - tw, 0, centerX + tw, 0)
      bark.addColorStop(0, '#2e1e14'); bark.addColorStop(0.3, '#4a3828')
      bark.addColorStop(0.7, '#4a3828'); bark.addColorStop(1, '#2e1e14')
      c.fillStyle = bark; c.beginPath()
      c.moveTo(centerX - tw * 1.3, gY)
      c.bezierCurveTo(centerX - tw, gY - 20, centerX - tw * 0.6, trunkTopY + 15, centerX - tw * 0.35, trunkTopY)
      c.lineTo(centerX + tw * 0.35, trunkTopY)
      c.bezierCurveTo(centerX + tw * 0.6, trunkTopY + 15, centerX + tw, gY - 20, centerX + tw * 1.3, gY)
      c.closePath(); c.fill()

      // Root base
      c.fillStyle = '#3a2a18'; c.beginPath()
      c.moveTo(centerX - tw * 1.3, gY)
      c.bezierCurveTo(centerX - tw * 1.8, gY + 15, centerX - tw * 2.5, gY + 25, centerX - tw * 2.8, gY + 35)
      c.lineTo(centerX + tw * 2.8, gY + 35)
      c.bezierCurveTo(centerX + tw * 2.5, gY + 25, centerX + tw * 1.8, gY + 15, centerX + tw * 1.3, gY)
      c.closePath(); c.fill()
    }

    // Leaves
    leavesRef.current.forEach(l => {
      l.x += l.dr + Math.sin(t * 0.4 + l.ph) * 0.2; l.y += l.spd
      if (l.y > gY) { l.y = -5; l.x = Math.random() * W }
      c.globalAlpha = l.op; c.fillStyle = `hsl(${l.hue},40%,40%)`
      c.save(); c.translate(l.x, l.y); c.rotate(Math.sin(t * 0.7 + l.ph) * 0.3)
      c.beginPath(); c.ellipse(0, 0, l.sz * 1.4, l.sz, 0, 0, Math.PI * 2); c.fill()
      c.restore()
    })
    c.globalAlpha = 1

    // ═══════════════════════════════════════════════════════════════
    // ROTATIONAL GLOW CALCULATION
    // ═══════════════════════════════════════════════════════════════
    const totalBranches = nodesRef.current.length
    const totalRoots = rootNodesRef.current.length
    const totalNodes = totalBranches + totalRoots
    
    // Slow rotation: completes one full cycle every ~8 seconds
    const rotationSpeed = 0.125 // cycles per second
    const rotationPhase = (t * rotationSpeed) % 1 // 0 to 1
    
    // Calculate which node index is currently "active" (brightest)
    const activeNodeFloat = rotationPhase * totalNodes
    
    // Function to get glow intensity for a node based on its position in the rotation
    const getGlowIntensity = (nodeIndex: number, isRoot: boolean): number => {
      // Branches are indexed 0 to totalBranches-1
      // Roots are indexed totalBranches to totalNodes-1
      const globalIndex = isRoot ? totalBranches + nodeIndex : nodeIndex
      
      // Distance from the active node (wrapping around)
      let dist = Math.abs(globalIndex - activeNodeFloat)
      if (dist > totalNodes / 2) dist = totalNodes - dist
      
      // Glow falloff: smooth gaussian-like curve
      // Nodes within ~2 positions of active get some glow
      const glowWidth = 2.5
      const intensity = Math.exp(-(dist * dist) / (2 * glowWidth * glowWidth))
      
      return intensity
    }

    // Helper to draw a node
    const drawNode = (node: KnowledgeNode, i: number, fade: number, isRoot: boolean) => {
      const nh = getHue(node, navStack)
      const isH = hoveredRef.current === node
      const hasCh = (node.children && node.children.length > 0) || !node._aiGenerated
      const r = (node._r || 20) * (isH ? 1.15 : 1) * Math.min(1, fade)
      const x = node._x || 0, y = node._y || 0

      // ═══════════════════════════════════════════════════════════════
      // ROTATIONAL GLOW EFFECT
      // ═══════════════════════════════════════════════════════════════
      const glowIntensity = getGlowIntensity(i, isRoot)
      
      if (glowIntensity > 0.05) {
        // Outer glow ring
        const glowRadius = r * (1.8 + glowIntensity * 1.2)
        const glowAlpha = glowIntensity * 0.4 * fade
        
        const glowGrad = c.createRadialGradient(x, y, r * 0.8, x, y, glowRadius)
        const glowHue = isRoot ? 45 : nh.h
        glowGrad.addColorStop(0, `hsla(${glowHue},${nh.s + 20}%,60%,${glowAlpha})`)
        glowGrad.addColorStop(0.5, `hsla(${glowHue},${nh.s + 10}%,50%,${glowAlpha * 0.5})`)
        glowGrad.addColorStop(1, `hsla(${glowHue},${nh.s}%,40%,0)`)
        
        c.fillStyle = glowGrad
        c.beginPath()
        c.arc(x, y, glowRadius, 0, Math.PI * 2)
        c.fill()
        
        // Subtle pulsing ring at peak intensity
        if (glowIntensity > 0.7) {
          const ringPulse = Math.sin(t * 3) * 0.5 + 0.5
          c.globalAlpha = (glowIntensity - 0.7) * ringPulse * 0.6 * fade
          c.strokeStyle = `hsl(${glowHue},${nh.s + 30}%,70%)`
          c.lineWidth = 2
          c.beginPath()
          c.arc(x, y, r + 8 + ringPulse * 4, 0, Math.PI * 2)
          c.stroke()
          c.globalAlpha = 1
        }
      }

      // Branch line
      const bw = Math.max(2, Math.min(6, Math.sqrt(countN(node)) * 1))
      // Make branch line glow too
      const lineGlow = glowIntensity * 0.3
      c.globalAlpha = (isRoot ? 0.5 : 0.7 + lineGlow) * fade
      c.strokeStyle = isRoot 
        ? `hsl(40,${30 + lineGlow * 20}%,${30 + lineGlow * 15}%)` 
        : `hsl(${nh.h},${Math.max(20, nh.s - 15 + lineGlow * 20)}%,${28 + lineGlow * 20}%)`
      c.lineWidth = bw + lineGlow * 2
      c.lineCap = 'round'
      c.beginPath()
      c.moveTo(node._bx || 0, node._by || 0)
      const mx = ((node._bx || 0) + x) / 2 + (x - (node._bx || 0)) * 0.08
      const my = ((node._by || 0) + y) / 2
      c.quadraticCurveTo(mx, my, x, y)
      c.stroke()
      c.globalAlpha = 1

      // Explored indicator (subtle ring)
      if (exploredNodes.has(node.name)) {
        c.globalAlpha = 0.15 * fade
        c.strokeStyle = '#f0d888'; c.lineWidth = 1.5
        c.beginPath(); c.arc(x, y, r + 5, 0, Math.PI * 2); c.stroke()
        c.globalAlpha = 1
      }

      // Infinite depth pulse on leaf nodes (no children yet)
      if (!node.children || node.children.length === 0) {
        const pulse = Math.sin(t * 2 + i * 1.3) * 0.5 + 0.5
        c.globalAlpha = 0.05 * pulse * fade
        c.fillStyle = `hsl(${nh.h},${nh.s}%,50%)`
        c.beginPath(); c.arc(x, y, r * 2.5 + pulse * 8, 0, Math.PI * 2); c.fill()
        c.globalAlpha = 1

        // Tiny seed particles drifting from leaf nodes
        for (let p = 0; p < 3; p++) {
          const pAngle = t * 0.5 + i + p * 2.1
          const pDist = r * 1.5 + ((t * 8 + p * 50) % 40)
          const px = x + Math.cos(pAngle) * pDist
          const py = y + Math.sin(pAngle) * pDist * 0.5 + pDist * 0.3
          c.globalAlpha = Math.max(0, (1 - pDist / 60) * 0.15) * fade
          c.fillStyle = `hsl(${nh.h},${nh.s}%,50%)`
          c.beginPath(); c.arc(px, py, 1.2, 0, Math.PI * 2); c.fill()
        }
        c.globalAlpha = 1
      }

      // Canopy glow
      if (hasCh && !isRoot) {
        const gr = c.createRadialGradient(x, y, r * 0.4, x, y, r * 2.5)
        gr.addColorStop(0, `hsla(${nh.h},${nh.s}%,35%,${0.18 * fade})`)
        gr.addColorStop(1, 'transparent')
        c.fillStyle = gr; c.beginPath(); c.arc(x, y, r * 2.5, 0, Math.PI * 2); c.fill()
      }

      // Sphere - enhanced brightness during glow
      const sphereBrightness = 40 + glowIntensity * 15
      const mg = c.createRadialGradient(x - r * 0.25, y - r * 0.3, 0, x, y, r)
      const bh = isRoot ? 35 : nh.h
      mg.addColorStop(0, `hsla(${bh},${isRoot ? 35 : nh.s}%,${isH ? 52 : sphereBrightness}%,${0.92 * fade})`)
      mg.addColorStop(1, `hsla(${bh},${isRoot ? 30 : nh.s}%,${isH ? 30 : 20 + glowIntensity * 10}%,${0.88 * fade})`)
      c.fillStyle = mg; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill()
      
      // Enhanced stroke during glow
      const strokeAlpha = (isH ? 0.55 : 0.2 + glowIntensity * 0.4) * fade
      c.strokeStyle = `hsla(${bh},${nh.s}%,${60 + glowIntensity * 20}%,${strokeAlpha})`
      c.lineWidth = isH ? 2.5 : 1.2 + glowIntensity * 1.5
      c.stroke()

      // Loading spinner on the clicked node
      if (loadingNode === node) {
        const spinAngle = t * 4
        const arcLen = Math.PI * 0.8
        c.globalAlpha = 0.9 * fade
        c.strokeStyle = '#f0d888'
        c.lineWidth = 2.5
        c.lineCap = 'round'
        c.beginPath()
        c.arc(x, y, r + 6, spinAngle, spinAngle + arcLen)
        c.stroke()
        // Second thinner arc going opposite direction
        c.globalAlpha = 0.4 * fade
        c.lineWidth = 1.5
        c.beginPath()
        c.arc(x, y, r + 10, -spinAngle, -spinAngle + arcLen * 0.6)
        c.stroke()
        c.globalAlpha = 1
        c.lineCap = 'butt'
      }

      // Shine
      c.globalAlpha = (0.18 + glowIntensity * 0.1) * fade
      const sh = c.createRadialGradient(x - r * 0.3, y - r * 0.32, 0, x, y, r * 0.8)
      sh.addColorStop(0, '#fff'); sh.addColorStop(1, 'transparent')
      c.fillStyle = sh; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill()
      c.globalAlpha = 1

      // Icon
      if (node.icon) {
        c.globalAlpha = 0.8 * fade
        c.font = `${r * 0.72}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'
        c.fillText(node.icon, x, y); c.globalAlpha = 1
      }

      // Label pill
      const fs = Math.max(10, Math.min(13, r * 0.36))
      c.font = `${isH ? 700 : 600} ${fs}px Nunito,sans-serif`
      const nameW = c.measureText(node.name).width
      const subT = hasCh ? (node.children ? `${node.children.length} branches` : '∞ deeper') : ''
      c.font = `400 ${fs - 1}px Nunito,sans-serif`
      const subW = subT ? c.measureText(subT).width : 0
      const pw = Math.max(nameW, subW) + 20
      const ph = subT ? fs * 2 + 14 : fs + 12
      const px = x - pw / 2, py = y + r + 8

      c.globalAlpha = (0.7 + glowIntensity * 0.2) * fade
      c.fillStyle = isRoot ? 'rgba(30,20,8,0.82)' : 'rgba(6,4,2,0.78)'
      c.beginPath()
      const rr = 7
      c.moveTo(px + rr, py); c.lineTo(px + pw - rr, py)
      c.quadraticCurveTo(px + pw, py, px + pw, py + rr); c.lineTo(px + pw, py + ph - rr)
      c.quadraticCurveTo(px + pw, py + ph, px + pw - rr, py + ph); c.lineTo(px + rr, py + ph)
      c.quadraticCurveTo(px, py + ph, px, py + ph - rr); c.lineTo(px, py + rr)
      c.quadraticCurveTo(px, py, px + rr, py); c.closePath(); c.fill()
      c.strokeStyle = `rgba(255,255,255,${0.04 + glowIntensity * 0.1})`; c.lineWidth = 0.5; c.stroke()
      c.globalAlpha = 1

      c.globalAlpha = (isH ? 1 : 0.9 + glowIntensity * 0.1) * fade
      c.font = `${isH ? 700 : 600} ${fs}px Nunito,sans-serif`
      c.textAlign = 'center'; c.textBaseline = 'top'
      c.fillStyle = isRoot ? '#d4c8a0' : '#f0ece4'
      c.fillText(node.name, x, py + 5)
      if (subT) {
        c.globalAlpha = (0.4 + glowIntensity * 0.2) * fade
        c.font = `400 ${fs - 1}px Nunito,sans-serif`
        c.fillStyle = isRoot ? '#a09070' : '#a0a098'
        c.fillText(subT, x, py + 5 + fs + 2)
      }
      c.globalAlpha = 1
    }

    // Non-tree view: center label
    if (!isTreeView) {
      const nh = getHue(currentNode, navStack)
      c.globalAlpha = 0.07
      c.font = `300 ${Math.min(44, W * 0.035)}px Lora,serif`
      c.textAlign = 'center'; c.textBaseline = 'middle'
      c.fillStyle = `hsl(${nh.h},${nh.s}%,55%)`
      c.fillText(currentNode.name, W / 2, H * 0.45)
      c.globalAlpha = 1
    }

    // Draw roots
    rootNodesRef.current.forEach((node, i) => {
      const fade = Math.min(1, animRef.current * 3 - i * 0.15)
      if (fade > 0) drawNode(node, i, fade, true)
    })

    // Draw branches
    nodesRef.current.forEach((node, i) => {
      const fade = Math.min(1, animRef.current * 3.5 - i * 0.12)
      if (fade > 0) drawNode(node, i, fade, false)
    })
  }, [isTreeView, currentNode, navStack, exploredNodes])

  // Animation loop
  useEffect(() => {
    let running = true
    const loop = (ts: number) => {
      if (!running) return
      timeRef.current = ts * 0.001
      animRef.current = Math.min(animRef.current + 0.03, 5)
      draw()
      requestAnimationFrame(loop)
    }
    animRef.current = 0
    requestAnimationFrame(loop)
    return () => { running = false }
  }, [draw])

  // Reset animation on navigation
  useEffect(() => { animRef.current = 0 }, [branches, roots])

  // Hit testing
  const hitTest = useCallback((mx: number, my: number): KnowledgeNode | null => {
    const all = [...nodesRef.current, ...rootNodesRef.current]
    for (let i = all.length - 1; i >= 0; i--) {
      const n = all[i]
      const dx = mx - (n._x || 0), dy = my - (n._y || 0)
      const r = n._r || 20
      if (dx * dx + dy * dy < (r + 12) * (r + 12)) return n
      if (Math.abs(dx) < 55 && dy > r && dy < r + 50) return n
    }
    return null
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const hit = hitTest(e.clientX, e.clientY)
    if (hit !== hoveredRef.current) {
      hoveredRef.current = hit
      if (canvasRef.current) {
        canvasRef.current.style.cursor = hit && (hit.children?.length || !hit._aiGenerated) ? 'pointer' : 'default'
      }
    }
  }, [hitTest])

  const handleClick = useCallback((e: React.MouseEvent) => {
    const hit = hitTest(e.clientX, e.clientY)
    if (hit) {
      onDrillInto(hit)
    }
  }, [hitTest, onDrillInto])

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    />
  )
}
