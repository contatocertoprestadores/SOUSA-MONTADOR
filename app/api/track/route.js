import { kv } from '@vercel/kv'

export async function GET() {
  try {
    const keys = await kv.keys('sousa:online:*')
    const online = keys.length
    
    const total = await kv.get('sousa:total_visitas') || 0
    const hoje = new Date().toISOString().slice(0, 10)
    const hojeTotal = await kv.get(`sousa:visitas_hoje:${hoje}`) || 0
    const apkDownloads = await kv.get('sousa:apk_downloads') || 0

    // Pega últimos 7 dias
    let semanaTotal = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dia = d.toISOString().slice(0, 10)
      const val = await kv.get(`sousa:visitas_hoje:${dia}`) || 0
      semanaTotal += Number(val)
    }

    let visitantes = []
    for (let key of keys) {
      const v = await kv.hgetall(key)
      if (v) visitantes.push(v)
    }

    // Ordena mais recentes primeiro
    visitantes.sort((a, b) => b.timestamp - a.timestamp)

    return Response.json({ 
      online, 
      total, 
      hoje: hojeTotal,
      semana: semanaTotal,
      apkDownloads,
      visitantes,
      timestamp: Date.now()
    })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}