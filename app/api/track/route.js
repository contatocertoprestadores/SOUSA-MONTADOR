// Versão SIMPLES sem @vercel/kv - funciona imediatamente
// Guarda em memória (reinicia quando faz deploy, mas já deixa site online)

const online = globalThis.__sousa_online || (globalThis.__sousa_online = new Map())
let total = globalThis.__sousa_total || 0
let hoje = globalThis.__sousa_hoje || 0

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || Math.random().toString(36).slice(2)
    const data = await req.json().catch(() => ({}))
    
    total++
    hoje++
    globalThis.__sousa_total = total
    globalThis.__sousa_hoje = hoje
    
    online.set(ip, {
      ip,
      pagina: data.pagina || '/',
      cidade: 'Assis-SP',
      dispositivo: data.dispositivo || 'Mobile',
      timestamp: Date.now()
    })

    // limpa visitantes antigos (90s)
    const agora = Date.now()
    for (let [k, v] of online) {
      if (agora - v.timestamp > 90000) online.delete(k)
    }

    return Response.json({ ok: true, total })
  } catch (e) {
    return Response.json({ ok: true })
  }
}
