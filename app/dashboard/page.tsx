'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'

interface Visitor {
  ip: string
  city: string
  region: string
  country: string
  lat: number
  lng: number
  timestamp: string
  userAgent: string
}

// Convert lat/lng to x/y on a simple equirectangular projection
function latLngToXY(lat: number, lng: number, width: number, height: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * width
  const y = ((90 - lat) / 180) * height
  return { x, y }
}

function WorldMap({ visitors, width, height }: { visitors: Visitor[]; width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(0)
  const timeRef = useRef(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const t = timeRef.current

    // Background
    ctx.fillStyle = '#0d1b2a'
    ctx.fillRect(0, 0, width, height)

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    ctx.lineWidth = 0.5
    for (let lat = -60; lat <= 80; lat += 20) {
      const y = ((90 - lat) / 180) * height
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
    }
    for (let lng = -180; lng <= 180; lng += 30) {
      const x = ((lng + 180) / 360) * width
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
    }

    // Simplified continent outlines (major landmasses as filled polygons)
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 0.8

    // Draw simplified continents using approximate polygon coordinates
    const continents = [
      // North America
      [[{ lat: 70, lng: -170 }, { lat: 72, lng: -130 }, { lat: 70, lng: -80 }, { lat: 60, lng: -65 }, { lat: 50, lng: -55 }, { lat: 45, lng: -65 }, { lat: 30, lng: -80 }, { lat: 25, lng: -100 }, { lat: 15, lng: -90 }, { lat: 10, lng: -85 }, { lat: 15, lng: -105 }, { lat: 20, lng: -110 }, { lat: 30, lng: -120 }, { lat: 48, lng: -125 }, { lat: 55, lng: -135 }, { lat: 60, lng: -148 }, { lat: 65, lng: -170 }]],
      // South America
      [[{ lat: 10, lng: -80 }, { lat: 5, lng: -60 }, { lat: -5, lng: -35 }, { lat: -15, lng: -40 }, { lat: -23, lng: -43 }, { lat: -35, lng: -55 }, { lat: -50, lng: -70 }, { lat: -55, lng: -68 }, { lat: -40, lng: -73 }, { lat: -20, lng: -70 }, { lat: -5, lng: -80 }]],
      // Europe
      [[{ lat: 70, lng: -10 }, { lat: 72, lng: 30 }, { lat: 65, lng: 45 }, { lat: 55, lng: 40 }, { lat: 45, lng: 40 }, { lat: 38, lng: 28 }, { lat: 36, lng: 5 }, { lat: 38, lng: -10 }, { lat: 43, lng: -10 }, { lat: 48, lng: -5 }, { lat: 55, lng: 8 }, { lat: 58, lng: 5 }, { lat: 62, lng: 5 }]],
      // Africa
      [[{ lat: 35, lng: -10 }, { lat: 37, lng: 10 }, { lat: 30, lng: 32 }, { lat: 10, lng: 45 }, { lat: -2, lng: 42 }, { lat: -12, lng: 40 }, { lat: -25, lng: 35 }, { lat: -35, lng: 20 }, { lat: -35, lng: 18 }, { lat: -15, lng: 12 }, { lat: 5, lng: 10 }, { lat: 5, lng: -5 }, { lat: 10, lng: -15 }, { lat: 15, lng: -17 }, { lat: 25, lng: -15 }]],
      // Asia
      [[{ lat: 65, lng: 45 }, { lat: 75, lng: 100 }, { lat: 70, lng: 180 }, { lat: 55, lng: 135 }, { lat: 45, lng: 130 }, { lat: 35, lng: 130 }, { lat: 25, lng: 120 }, { lat: 10, lng: 105 }, { lat: 5, lng: 100 }, { lat: 10, lng: 80 }, { lat: 25, lng: 65 }, { lat: 30, lng: 50 }, { lat: 35, lng: 35 }, { lat: 45, lng: 40 }, { lat: 55, lng: 40 }]],
      // Australia
      [[{ lat: -12, lng: 130 }, { lat: -15, lng: 140 }, { lat: -20, lng: 148 }, { lat: -28, lng: 153 }, { lat: -35, lng: 150 }, { lat: -38, lng: 145 }, { lat: -35, lng: 135 }, { lat: -32, lng: 115 }, { lat: -22, lng: 114 }, { lat: -12, lng: 125 }]],
    ]

    continents.forEach(continent => {
      continent.forEach(poly => {
        ctx.beginPath()
        const first = latLngToXY(poly[0].lat, poly[0].lng, width, height)
        ctx.moveTo(first.x, first.y)
        poly.forEach(pt => {
          const p = latLngToXY(pt.lat, pt.lng, width, height)
          ctx.lineTo(p.x, p.y)
        })
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      })
    })

    // Equator line
    const eqY = height / 2
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 8])
    ctx.beginPath(); ctx.moveTo(0, eqY); ctx.lineTo(width, eqY); ctx.stroke()
    ctx.setLineDash([])

    // Draw visitor pins
    visitors.forEach((v, i) => {
      if (!v.lat || !v.lng) return
      const { x, y } = latLngToXY(v.lat, v.lng, width, height)

      // Pulse ring
      const pulsePhase = (t * 2 + i * 0.5) % (Math.PI * 2)
      const pulseR = 4 + Math.sin(pulsePhase) * 3
      ctx.globalAlpha = 0.15 + Math.sin(pulsePhase) * 0.1
      ctx.fillStyle = '#d4a853'
      ctx.beginPath()
      ctx.arc(x, y, pulseR + 6, 0, Math.PI * 2)
      ctx.fill()

      // Glow
      ctx.globalAlpha = 0.3
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 12)
      glow.addColorStop(0, 'rgba(212,168,83,0.4)')
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(x, y, 12, 0, Math.PI * 2)
      ctx.fill()

      // Pin dot
      ctx.globalAlpha = 1
      ctx.fillStyle = i === 0 ? '#4ade80' : '#d4a853' // Green for most recent
      ctx.beginPath()
      ctx.arc(x, y, 3.5, 0, Math.PI * 2)
      ctx.fill()

      // White border
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Label for most recent visitors (first 5)
      if (i < 5) {
        ctx.globalAlpha = 0.8
        ctx.font = '10px Nunito, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillStyle = '#fff'
        const label = `${v.city}, ${v.country}`
        const labelX = x + 8
        const labelY = y + 3

        // Background pill
        const tw = ctx.measureText(label).width
        ctx.globalAlpha = 0.6
        ctx.fillStyle = 'rgba(0,0,0,0.7)'
        ctx.beginPath()
        ctx.roundRect(labelX - 4, labelY - 9, tw + 8, 14, 4)
        ctx.fill()

        ctx.globalAlpha = 0.9
        ctx.fillStyle = i === 0 ? '#4ade80' : '#e0dcd4'
        ctx.fillText(label, labelX, labelY)
      }
    })

    ctx.globalAlpha = 1
  }, [visitors, width, height])

  useEffect(() => {
    let running = true
    const animate = (ts: number) => {
      if (!running) return
      timeRef.current = ts * 0.001
      draw()
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => { running = false; cancelAnimationFrame(animRef.current) }
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      className="rounded-lg"
    />
  )
}

export default function DashboardPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(true)
  const [currentVisitor, setCurrentVisitor] = useState<Visitor | null>(null)
  const [mapWidth, setMapWidth] = useState(900)

  useEffect(() => {
    const updateWidth = () => setMapWidth(Math.min(window.innerWidth - 48, 1100))
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  useEffect(() => {
    const logVisitor = async () => {
      try {
        const response = await fetch('/api/log-visitor', { method: 'POST' })
        const data = await response.json()
        if (data.visitor) setCurrentVisitor(data.visitor)
      } catch (error) { console.error('Failed to log visitor:', error) }
    }

    const fetchVisitors = async () => {
      try {
        const response = await fetch('/api/log-visitor')
        const data = await response.json()
        setVisitors(data.visitors || [])
      } catch (error) { console.error('Failed to fetch visitors:', error) }
      finally { setLoading(false) }
    }

    logVisitor().then(fetchVisitors)
    const interval = setInterval(fetchVisitors, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    })
  }

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'Canada': '🇨🇦',
      'Germany': '🇩🇪', 'France': '🇫🇷', 'Australia': '🇦🇺',
      'Japan': '🇯🇵', 'China': '🇨🇳', 'India': '🇮🇳',
      'Brazil': '🇧🇷', 'Mexico': '🇲🇽', 'Spain': '🇪🇸',
      'Italy': '🇮🇹', 'Netherlands': '🇳🇱', 'Sweden': '🇸🇪',
      'Norway': '🇳🇴', 'Denmark': '🇩🇰', 'Finland': '🇫🇮',
      'Poland': '🇵🇱', 'Russia': '🇷🇺', 'South Korea': '🇰🇷',
      'Singapore': '🇸🇬', 'Ireland': '🇮🇪', 'Switzerland': '🇨🇭',
      'Austria': '🇦🇹', 'Belgium': '🇧🇪', 'Portugal': '🇵🇹',
      'Argentina': '🇦🇷', 'Chile': '🇨🇱', 'Colombia': '🇨🇴',
      'Philippines': '🇵🇭', 'Indonesia': '🇮🇩', 'Thailand': '🇹🇭',
      'Vietnam': '🇻🇳', 'Malaysia': '🇲🇾', 'Turkey': '🇹🇷',
      'Israel': '🇮🇱', 'Egypt': '🇪🇬', 'South Africa': '🇿🇦',
      'Nigeria': '🇳🇬', 'Kenya': '🇰🇪', 'New Zealand': '🇳🇿',
      'Taiwan': '🇹🇼', 'Hong Kong': '🇭🇰', 'Romania': '🇷🇴',
      'Czech Republic': '🇨🇿', 'Greece': '🇬🇷', 'Ukraine': '🇺🇦',
    }
    return flags[country] || '🌍'
  }

  const mapHeight = Math.round(mapWidth * 0.5)

  return (
    <main className="min-h-screen bg-[#0a1424] text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-8">
          <Link href="/" className="text-[#d4a853] hover:text-[#f0d888] mb-4 inline-block transition-colors">
            ← Back to Tree of Knowledge
          </Link>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Lora', serif" }}>Visitor Dashboard</h1>
          <p className="text-white/30">Real-time visitor logging with geolocation</p>
        </header>

        {/* Current Visitor Card */}
        {currentVisitor && (
          <div className="bg-emerald-900/15 border border-emerald-500/20 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-emerald-400 mb-3">👋 Your Visit</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-white/25">Location</span>
                <p className="text-white">{getCountryFlag(currentVisitor.country)} {currentVisitor.city}, {currentVisitor.region}</p>
              </div>
              <div>
                <span className="text-white/25">Country</span>
                <p className="text-white">{currentVisitor.country}</p>
              </div>
              <div>
                <span className="text-white/25">IP (masked)</span>
                <p className="text-white font-mono text-xs">{currentVisitor.ip}</p>
              </div>
              <div>
                <span className="text-white/25">Time</span>
                <p className="text-white">{formatDate(currentVisitor.timestamp)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { value: visitors.length, label: 'Total Visits', color: 'text-emerald-400' },
            { value: new Set(visitors.map(v => v.country)).size, label: 'Countries', color: 'text-blue-400' },
            { value: new Set(visitors.map(v => v.city)).size, label: 'Cities', color: 'text-purple-400' },
            { value: visitors.filter(v => new Date(v.timestamp) > new Date(Date.now() - 3600000)).length, label: 'Last Hour', color: 'text-[#d4a853]' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-white/25 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Global Map */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-[#f0ece4]" style={{ fontFamily: "'Lora', serif" }}>🌍 Visitor Map</h2>
          <div className="flex justify-center">
            <WorldMap visitors={visitors} width={mapWidth} height={mapHeight} />
          </div>
          {visitors.length === 0 && !loading && (
            <p className="text-center text-white/20 text-sm mt-4">No visitors with location data yet. Pin drops will appear as visitors arrive.</p>
          )}
        </div>

        {/* Visitor Log Table */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.05]">
            <h2 className="text-lg font-semibold" style={{ fontFamily: "'Lora', serif" }}>Recent Visitors</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-white/25">Loading visitor data...</div>
          ) : visitors.length === 0 ? (
            <div className="p-8 text-center text-white/25">No visitors logged yet. You are the first!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/[0.02]">
                  <tr>
                    {['', 'City', 'State/Region', 'Country', 'Date & Time', 'IP'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-white/25 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {visitors.map((visitor, index) => (
                    <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-2xl">{getCountryFlag(visitor.country)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{visitor.city}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">{visitor.region}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">{visitor.country}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/30">{formatDate(visitor.timestamp)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white/15">{visitor.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-center text-white/15 text-sm mt-8">
          Data refreshes every 30 seconds • IPs are partially masked for privacy
        </p>
      </div>
    </main>
  )
}
