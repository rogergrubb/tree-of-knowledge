import { NextRequest, NextResponse } from 'next/server'

// In-memory store for demo (resets on cold start)
// For production, use Vercel KV, Supabase, or similar
const visitors: Array<{
  ip: string
  city: string
  region: string
  country: string
  timestamp: string
  userAgent: string
}> = []

const MAX_VISITORS = 100

export async function GET(request: NextRequest) {
  return NextResponse.json({ visitors: visitors.slice(0, 50) })
}

export async function POST(request: NextRequest) {
  try {
    // Get IP from headers (Vercel provides these)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'
    
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Get geolocation from ip-api.com (free, no key required)
    let city = 'Unknown'
    let region = 'Unknown'
    let country = 'Unknown'
    
    if (ip && ip !== 'unknown' && ip !== '::1' && ip !== '127.0.0.1') {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country`)
        if (geoResponse.ok) {
          const geoData = await geoResponse.json()
          city = geoData.city || 'Unknown'
          region = geoData.regionName || 'Unknown'
          country = geoData.country || 'Unknown'
        }
      } catch (geoError) {
        console.error('Geolocation error:', geoError)
      }
    }
    
    const visitor = {
      ip: ip.substring(0, 3) + '.***.***', // Partially mask IP for privacy
      city,
      region,
      country,
      timestamp: new Date().toISOString(),
      userAgent: userAgent.substring(0, 100),
    }
    
    // Add to beginning of array
    visitors.unshift(visitor)
    
    // Keep only last MAX_VISITORS
    if (visitors.length > MAX_VISITORS) {
      visitors.pop()
    }
    
    return NextResponse.json({ success: true, visitor })
  } catch (error) {
    console.error('Log visitor error:', error)
    return NextResponse.json({ error: 'Failed to log visitor' }, { status: 500 })
  }
}
