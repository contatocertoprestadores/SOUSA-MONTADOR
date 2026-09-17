import { kv } from '@vercel/kv'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}))
    const id = body.id || Math.random().toString(36).slice(2)
    const now = Date.now()

    const data = {
      id,
      page: body.page || '/',
      source: body.source || 'site',
      city: body.city || 'Assis-SP',
      lastSeen: now,
    }

    // Salva com expire de 120 segundos (se não pingar, sai do online)
    await kv.hset(`online:${id}`, data)
    await kv.expire(`online:${id}`, 120)
    
    // Contador total
    await kv.incr('visitors:total')

    return new Response(JSON.stringify({ ok: true, id }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      }
    })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

export async function GET() {
  return new Response(JSON.stringify({ ok: true, message: 'Use POST' }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}
