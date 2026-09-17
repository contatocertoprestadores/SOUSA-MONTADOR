import { kv } from '@vercel/kv'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const keys = await kv.keys('online:*')
    let online = []

    if (keys && keys.length > 0) {
      const vals = await kv.mget(...keys)
      online = vals.filter(Boolean)
      // Filtra só quem pingou nos últimos 90s
      const now = Date.now()
      online = online.filter(o => now - (o.lastSeen || 0) < 90000)
    }

    const total = (await kv.get('visitors:total')) || 0

    return new Response(JSON.stringify({
      onlineCount: online.length,
      online,
      total,
      timestamp: Date.now()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })
  } catch (e) {
    return new Response(JSON.stringify({
      onlineCount: 0,
      online: [],
      total: 0,
      error: e.message,
      timestamp: Date.now()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}
