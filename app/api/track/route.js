import { kv } from '@vercel/kv'
export const dynamic = 'force-dynamic'
export async function OPTIONS() {
  return new Response(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } })
}
export async function POST(req) {
  try {
    const b = await req.json().catch(()=>({}))
    const id = b.id || Math.random().toString(36).slice(2)
    const now = Date.now()
    await kv.hset(`online:${id}`, { id, page: b.page||'/', source: b.source||'site', city: b.city||'Assis', lastSeen: now })
    await kv.expire(`online:${id}`, 120)
    await kv.incr('visitors:total')
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } })
  }
}
