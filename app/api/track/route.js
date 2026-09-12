import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()
    const id = body.id || Math.random().toString(36).slice(2)
    const now = Date.now()
    
    // Salva visitante online com expiração de 2 minutos
    await kv.hset(`online:${id}`, {
      id,
      city: body.city || 'Assis',
      page: body.page || '/',
      lastSeen: now,
      ua: req.headers.get('user-agent') || ''
    })
    await kv.expire(`online:${id}`, 120)

    // Contador total
    await kv.incr('visitors:total')
    
    // Lista de visitas para historico
    await kv.lpush('visitors:list', JSON.stringify({
      id, city: body.city || 'Assis', page: body.page || '/', time: now
    }))
    await kv.ltrim('visitors:list', 0, 499)

    return NextResponse.json({ ok: true, id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
