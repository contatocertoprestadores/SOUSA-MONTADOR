const online = globalThis.__sousa_online || (globalThis.__sousa_online = new Map())
export async function GET() {
  const agora = Date.now()
  for (let [k, v] of online) {
    if (agora - v.timestamp > 90000) online.delete(k)
  }

  const visitantes = Array.from(online.values()).sort((a,b) => b.timestamp - a.timestamp)
  
  return Response.json({
    online: visitantes.length,
    total: globalThis.__sousa_total || 0,
    hoje: globalThis.__sousa_hoje || 0,
    semana: globalThis.__sousa_total || 0,
    apkDownloads: 0,
    visitantes,
    timestamp: Date.now()
  })
}
