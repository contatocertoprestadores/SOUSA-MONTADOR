'use client'
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [data, setData] = useState({ onlineCount: 0, online: [], total: 0, timestamp: 0 })
  const [pedidosData, setPedidosData] = useState({ pedidos: [], total: 0 })

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('sousa_admin') === 'ok') setAuthed(true)
  }, [])

  useEffect(() => {
    if (!authed) return
    const fetchAll = async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch('/api/visitors', { cache: 'no-store' }).then(r=>r.json()).catch(()=>({onlineCount:0,online:[],total:0})),
          fetch('/api/pedidos', { cache: 'no-store' }).then(r=>r.json()).catch(()=>({pedidos:[],total:0}))
        ])
        setData(r1)
        setPedidosData(r2)
      } catch {}
    }
    fetchAll()
    const iv = setInterval(fetchAll, 3000)
    return () => clearInterval(iv)
  }, [authed])

  const login = () => {
    if (pass === 'sousa2024') {
      localStorage.setItem('sousa_admin', 'ok')
      setAuthed(true)
    } else alert('Senha errada')
  }

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fff' }}>
        <div style={{ background: '#1a1a1a', padding: 30, borderRadius: 12, width: 320, textAlign: 'center' }}>
          <h2 style={{marginBottom:20}}>Sousa Montador - Admin</h2>
          <input type="password" placeholder="Senha" value={pass} onChange={e=>setPass(e.target.value)} 
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #333', background:'#222', color:'#fff' }} />
          <button onClick={login} style={{ width: '100%', marginTop: 12, padding: 12, background: '#7A1F1F', color: '#fff', border: 'none', borderRadius: 8, cursor:'pointer' }}>Entrar</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', padding: 20, fontFamily: 'system-ui' }}>
      <div style={{maxWidth:1200, margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <h1 style={{margin:0}}>📊 Painel Tempo Real</h1>
            <p style={{color:'#888', margin:'5px 0'}}>Atualiza a cada 3 segundos • Sousa Montador</p>
          </div>
          <button onClick={()=>{localStorage.removeItem('sousa_admin'); location.reload()}} style={{padding:'8px 16px', background:'#222', color:'#fff', border:'1px solid #333', borderRadius:8}}>Sair</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 15, marginTop: 25 }}>
          <div style={{ background: '#1a1a1a', padding: 20, borderRadius: 12, border:'1px solid #222' }}>
            <div style={{color:'#888', fontSize:13}}>🟢 ONLINE AGORA</div>
            <div style={{ fontSize: 48, fontWeight: 'bold', color: data.onlineCount>0?'#22c55e':'#666' }}>{data.onlineCount}</div>
            <div style={{color:'#888', fontSize:13}}>Última atualização: {new Date(data.timestamp||Date.now()).toLocaleTimeString('pt-BR')}</div>
          </div>
          <div style={{ background: '#1a1a1a', padding: 20, borderRadius: 12, border:'1px solid #222' }}>
            <div style={{color:'#888', fontSize:13}}>👁️ TOTAL DE VISITAS</div>
            <div style={{ fontSize: 48, fontWeight: 'bold' }}>{data.total}</div>
            <div style={{color:'#888', fontSize:13}}>Desde o início</div>
          </div>
          <div style={{ background: '#1a1a1a', padding: 20, borderRadius: 12, border:'1px solid #222' }}>
            <div style={{color:'#888', fontSize:13}}>📦 PEDIDOS RECEBIDOS</div>
            <div style={{ fontSize: 48, fontWeight: 'bold', color:'#f59e0b' }}>{pedidosData.total}</div>
            <div style={{color:'#888', fontSize:13}}>{pedidosData.pedidos.filter(p=>p.status==='novo').length} novos</div>
          </div>
        </div>

        <div style={{ marginTop: 25, background: '#1a1a1a', padding: 20, borderRadius: 12, border:'1px solid #222' }}>
          <h3 style={{marginTop:0}}>Quem está online agora ({data.onlineCount})</h3>
          {data.online.length === 0 ? (
            <div style={{color:'#666', padding:'20px 0', textAlign:'center'}}>
              Nenhum visitante online no momento.<br/>
              <small>Abra o site em outra aba anônima pra testar. Se aparecer aqui, o tempo real funcionou.</small>
            </div>
          ) : data.online.map(o => (
            <div key={o.id} style={{ borderBottom: '1px solid #222', padding: '12px 0', display: 'flex', justifyContent: 'space-between', fontSize:14 }}>
              <span>📌 <strong>{o.page}</strong> • {o.source} • {o.city}</span>
              <span style={{ color: '#22c55e', fontSize: 12 }}>{Math.round((Date.now() - (o.lastSeen||0))/1000)}s atrás • ONLINE</span>
            </div>
          ))}
        </div>

        {pedidosData.pedidos.length > 0 && (
          <div style={{ marginTop: 25, background: '#1a1a1a', padding: 20, borderRadius: 12, border:'1px solid #222' }}>
            <h3 style={{marginTop:0}}>Últimos pedidos</h3>
            {pedidosData.pedidos.slice(0,10).map(p => (
              <div key={p.id} style={{ borderBottom: '1px solid #222', padding: '10px 0', fontSize:14 }}>
                <strong>{p.servico}</strong> - R$ {p.valor} • {p.cidade} • {p.createdAtFormatted} • {p.source}
              </div>
            ))}
          </div>
        )}

        <div style={{marginTop:30, color:'#555', fontSize:12, textAlign:'center'}}>
          Sistema em tempo real via Vercel KV (Redis) • Ping a cada 20s • Expira em 90s sem atividade
        </div>
      </div>
    </div>
  )
}
