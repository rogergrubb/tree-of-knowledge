'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Visitor {
  ip: string
  city: string
  region: string
  country: string
  timestamp: string
  userAgent: string
}

export default function DashboardPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(true)
  const [currentVisitor, setCurrentVisitor] = useState<Visitor | null>(null)

  useEffect(() => {
    // Log current visitor
    const logVisitor = async () => {
      try {
        const response = await fetch('/api/log-visitor', { method: 'POST' })
        const data = await response.json()
        if (data.visitor) {
          setCurrentVisitor(data.visitor)
        }
      } catch (error) {
        console.error('Failed to log visitor:', error)
      }
    }

    // Fetch all visitors
    const fetchVisitors = async () => {
      try {
        const response = await fetch('/api/log-visitor')
        const data = await response.json()
        setVisitors(data.visitors || [])
      } catch (error) {
        console.error('Failed to fetch visitors:', error)
      } finally {
        setLoading(false)
      }
    }

    logVisitor().then(fetchVisitors)

    // Refresh every 30 seconds
    const interval = setInterval(fetchVisitors, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  }

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'United States': 'ðŸ‡ºðŸ‡¸',
      'United Kingdom': 'ðŸ‡¬ðŸ‡§',
      'Canada': 'ðŸ‡¨ðŸ‡¦',
      'Germany': 'ðŸ‡©ðŸ‡ª',
      'France': 'ðŸ‡«ðŸ‡·',
      'Australia': 'ðŸ‡¦ðŸ‡º',
      'Japan': 'ðŸ‡¯ðŸ‡µ',
      'China': 'ðŸ‡¨ðŸ‡³',
      'India': 'ðŸ‡®ðŸ‡³',
      'Brazil': 'ðŸ‡§ðŸ‡·',
      'Mexico': 'ðŸ‡²ðŸ‡½',
      'Spain': 'ðŸ‡ªðŸ‡¸',
      'Italy': 'ðŸ‡®ðŸ‡¹',
      'Netherlands': 'ðŸ‡³ðŸ‡±',
      'Sweden': 'ðŸ‡¸ðŸ‡ª',
      'Norway': 'ðŸ‡³ðŸ‡´',
      'Denmark': 'ðŸ‡©ðŸ‡°',
      'Finland': 'ðŸ‡«ðŸ‡®',
      'Poland': 'ðŸ‡µðŸ‡±',
      'Russia': 'ðŸ‡·ðŸ‡º',
      'South Korea': 'ðŸ‡°ðŸ‡·',
      'Singapore': 'ðŸ‡¸ðŸ‡¬',
    }
    return flags[country] || 'ðŸŒ'
  }

  return (
    <main className="min-h-screen bg-[#0a1424] text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-8">
          <Link href="/" className="text-green-400 hover:text-green-300 mb-4 inline-block">
            â† Back to Tree of Knowledge
          </Link>
          <h1 className="text-3xl font-bold mb-2">Visitor Dashboard</h1>
          <p className="text-gray-400">Real-time visitor logging with location data</p>
        </header>

        {/* Current Visitor Card */}
        {currentVisitor && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-green-400 mb-3">ðŸ‘‹ Your Visit</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Location</span>
                <p className="text-white">
                  {getCountryFlag(currentVisitor.country)} {currentVisitor.city}, {currentVisitor.region}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Country</span>
                <p className="text-white">{currentVisitor.country}</p>
              </div>
              <div>
                <span className="text-gray-500">IP (masked)</span>
                <p className="text-white font-mono">{currentVisitor.ip}</p>
              </div>
              <div>
                <span className="text-gray-500">Time</span>
                <p className="text-white">{formatDate(currentVisitor.timestamp)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{visitors.length}</p>
            <p className="text-gray-400 text-sm">Total Visits</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">
              {new Set(visitors.map(v => v.country)).size}
            </p>
            <p className="text-gray-400 text-sm">Countries</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">
              {new Set(visitors.map(v => v.city)).size}
            </p>
            <p className="text-gray-400 text-sm">Cities</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-yellow-400">
              {visitors.filter(v => {
                const visitTime = new Date(v.timestamp)
                const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
                return visitTime > hourAgo
              }).length}
            </p>
            <p className="text-gray-400 text-sm">Last Hour</p>
          </div>
        </div>

        {/* Visitor Log Table */}
        <div className="bg-gray-800/30 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold">Recent Visitors</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              Loading visitor data...
            </div>
          ) : visitors.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No visitors logged yet. You're the first!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      State/Region
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      IP
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {visitors.map((visitor, index) => (
                    <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-2xl">
                        {getCountryFlag(visitor.country)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {visitor.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {visitor.region}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {visitor.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatDate(visitor.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {visitor.ip}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Data refreshes every 30 seconds â€¢ IPs are partially masked for privacy
        </p>
      </div>
    </main>
  )
}
