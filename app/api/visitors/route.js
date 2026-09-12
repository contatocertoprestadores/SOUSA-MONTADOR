import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const keys = await kv.keys('online:*')
    let online = []
    if (keys.length > 0) {
      const vals = await kv.mget(...keys)
      online = vals.filter(Boolean)
    }
    // Remove duplicados e expirados (>90s)
    const now = Date.now()
    online = online.filter(o => now - (o.lastSeen || 0) < 90000)
    
    const total = (await kv.get('visitors:total')) || 0
    const listRaw = (await kv.lrange('visitors:list', 0, 49)) || []
    const list = listRaw.map(v => { try { return JSON.parse(v) } catch { return null } }).filter(Boolean)

    return NextResponse.json({
      onlineCount: online.length,
      online,
      total,
      recent: list
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ onlineCount: 0, online: [], total: 0, recent: [], error: e.message })
  }
}
