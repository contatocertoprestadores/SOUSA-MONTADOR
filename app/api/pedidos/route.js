import { kv } from '@vercel/kv'

export const dynamic = 'force-dynamic'

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

// POST - Criar novo pedido (vem do site quando clica em WhatsApp)
export async function POST(req) {
  try {
    const body = await req.json()
    
    const pedido = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      nome: body.nome || 'Cliente',
      telefone: body.telefone || '',
      servico: body.servico || 'Montagem',
      valor: body.valor || 0,
      cidade: body.cidade || 'Assis-SP',
      endereco: body.endereco || '',
      data: body.data || '',
      horario: body.horario || '',
      observacao: body.observacao || '',
      source: body.source || 'site', // site ou app
      status: 'novo', // novo, aceito, concluido, cancelado
      createdAt: Date.now(),
      createdAtFormatted: new Date().toLocaleString('pt-BR')
    }

    // Salva pedido individual
    await kv.hset(`pedido:${pedido.id}`, pedido)
    
    // Lista para admin (LPUSH)
    await kv.lpush('pedidos:lista', JSON.stringify(pedido))
    await kv.ltrim('pedidos:lista', 0, 999)
    
    // Contadores
    await kv.incr('pedidos:total')
    await kv.incr(`pedidos:${pedido.source}:total`)
    
    // Marca como online também (para aparecer no tempo real)
    await kv.hset(`online:${pedido.id}`, {
      id: pedido.id,
      page: `/pedido/${pedido.servico}`,
      source: pedido.source,
      city: pedido.cidade,
      lastSeen: Date.now()
    })
    await kv.expire(`online:${pedido.id}`, 300)

    return new Response(JSON.stringify({ ok: true, pedido }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

// GET - Listar todos pedidos para o admin
export async function GET() {
  try {
    const raw = await kv.lrange('pedidos:lista', 0, 100)
    const pedidos = raw.map(s => {
      try { return JSON.parse(s) } catch { return null }
    }).filter(Boolean)

    const total = (await kv.get('pedidos:total')) || 0
    const totalSite = (await kv.get('pedidos:site:total')) || 0
    const totalApp = (await kv.get('pedidos:app:total')) || 0

    // Conta por status
    const novos = pedidos.filter(p => p.status === 'novo').length

    return new Response(JSON.stringify({
      pedidos,
      total,
      totalSite,
      totalApp,
      novos,
      timestamp: Date.now()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ pedidos: [], total: 0, error: e.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

// DELETE - Remover pedido ou atualizar status via query ?id=xxx&status=concluido
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) throw new Error('id required')

    await kv.del(`pedido:${id}`)
    // Remove da lista (reconstrói lista sem o id)
    const raw = await kv.lrange('pedidos:lista', 0, 999)
    const filtered = raw.filter(s => {
      try { return JSON.parse(s).id !== id } catch { return true }
    })
    await kv.del('pedidos:lista')
    if (filtered.length) await kv.lpush('pedidos:lista', ...filtered.reverse())

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
  }
}
