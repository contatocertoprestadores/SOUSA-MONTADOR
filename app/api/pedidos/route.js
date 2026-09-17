import { kv } from '@vercel/kv'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}

export async function POST(req) {
  try {
    const body = await req.json().catch(()=>({}))
    const pedido = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      servico: body.servico || 'Montagem',
      valor: body.valor || 0,
      cidade: body.cidade || 'Assis-SP',
      source: body.source || 'site',
      status: 'novo',
      createdAt: Date.now(),
      createdAtFormatted: new Date().toLocaleString('pt-BR')
    }
    await kv.hset(`pedido:${pedido.id}`, pedido)
    await kv.lpush('pedidos:lista', JSON.stringify(pedido))
    await kv.ltrim('pedidos:lista', 0, 500)
    await kv.incr('pedidos:total')

    return new Response(JSON.stringify({ ok: true, pedido }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

export async function GET() {
  try {
    const raw = await kv.lrange('pedidos:lista', 0, 100)
    const pedidos = raw.map(s => { try { return JSON.parse(s) } catch { return null } }).filter(Boolean)
    const total = (await kv.get('pedidos:total')) || 0
    return new Response(JSON.stringify({ pedidos, total, timestamp: Date.now() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ pedidos: [], total: 0, error: e.message }), {
      status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}
