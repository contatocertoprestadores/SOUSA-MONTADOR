import { kv } from '@vercel/kv'
export const dynamic = 'force-dynamic'
export async function OPTIONS() { return new Response(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } }) }
export async function POST(req) {
  try {
    const b = await req.json().catch(()=>({}))
    const p = { id: Math.random().toString(36).slice(2)+Date.now().toString(36), servico: b.servico||'Montagem', valor: b.valor||0, cidade: b.cidade||'Assis', source: b.source||'site', status: 'novo', createdAt: Date.now(), createdAtFormatted: new Date().toLocaleString('pt-BR') }
    await kv.hset(`pedido:${p.id}`, p); await kv.lpush('pedidos:lista', JSON.stringify(p)); await kv.ltrim('pedidos:lista',0,500); await kv.incr('pedidos:total')
    return new Response(JSON.stringify({ ok: true, pedido: p }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
  } catch { return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }) }
}
export async function GET() {
  try {
    const raw = await kv.lrange('pedidos:lista',0,100)
    const pedidos = raw.map(s=>{try{return JSON.parse(s)}catch{return null}}).filter(Boolean)
    const total = (await kv.get('pedidos:total'))||0
    return new Response(JSON.stringify({ pedidos, total }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } })
  } catch { return new Response(JSON.stringify({ pedidos: [], total: 0 }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }) }
}
