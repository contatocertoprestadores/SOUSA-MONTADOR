'use client'
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [data, setData] = useState({ onlineCount: 0, online: [], total: 0, recent: [] })

  useEffect(() => {
    if (localStorage.getItem('sousa_admin') === 'ok') setAuthed(true)
  }, [])

  useEffect(() => {
    if (!authed) return
    const fetchData = async () => {
      try {
        const r = await fetch('/api/visitors', { cache: 'no-store' })
        const j = await r.json()
        setData(j)
      } catch {}
    }
    fetchData()
    const iv = setInterval(fetchData, 3000)
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff' }}>
        <div style={{ background: '#222', padding: 30, borderRadius: 12, width: 320 }}>
          <h2>Admin Sousa</h2>
          <input type="password" placeholder="Senha" value={pass} onChange={e=>setPass(e.target.value)} 
            style={{ width: '100%', padding: 10, marginTop: 10, borderRadius: 8, border: 'none' }} />
          <button onClick={login} style={{ width: '100%', marginTop: 10, padding: 10, background: '#7A1F1F', color: '#fff', border: 'none', borderRadius: 8 }}>Entrar</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', padding: 20, fontFamily: 'sans-serif' }}>
      <h1>📊 Painel Tempo Real - Sousa Montador</h1>
      <p>Atualiza a cada 3 segundos</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15, marginTop: 20 }}>
        <div style={{ background: '#1e1e1e', padding: 20, borderRadius: 12 }}>
          <h3>🟢 ONLINE AGORA</h3>
          <div style={{ fontSize: 42, fontWeight: 'bold', color: '#22c55e' }}>{data.onlineCount}</div>
          <div>Site: {data.onlineSite} | App: {data.onlineApp}</div>
        </div>
        <div style={{ background: '#1e1e1e', padding: 20, borderRadius: 12 }}>
          <h3>👁️ TOTAL VISITAS</h3>
          <div style={{ fontSize: 42, fontWeight: 'bold' }}>{data.total}</div>
        </div>
        <div style={{ background: '#1e1e1e', padding: 20, borderRadius: 12 }}>
          <h3>🕒 ÚLTIMA ATUALIZAÇÃO</h3>
          <div>{new Date(data.timestamp || Date.now()).toLocaleTimeString('pt-BR')}</div>
          <button onClick={()=>{localStorage.removeItem('sousa_admin'); location.reload()}} style={{ marginTop: 10, padding: '5px 10px' }}>Sair</button>
        </div>
      </div>

      <div style={{ marginTop: 30, background: '#1e1e1e', padding: 20, borderRadius: 12 }}>
        <h3>Quem está online agora:</h3>
        {data.online.length === 0 && <p style={{ color: '#888' }}>Nenhum visitante online no momento. Abra o site em outra aba pra testar.</p>}
        {data.online.map(o => (
          <div key={o.id} style={{ borderBottom: '1px solid #333', padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span>📌 {o.page} | {o.source} | {o.city}</span>
            <span style={{ color: '#888', fontSize: 12 }}>{Math.round((Date.now() - o.lastSeen)/1000)}s atrás</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, background: '#1e1e1e', padding: 20, borderRadius: 12 }}>
        <h3>Histórico recente:</h3>
        {data.recent?.slice(0,20).map((r,i) => (
          <div key={i} style={{ fontSize: 13, color: '#aaa', padding: '4px 0' }}>
            {new Date(r.time || r.lastSeen).toLocaleString('pt-BR')} - {r.page} - {r.source}
          </div>
        ))}
      </div>
    </div>
  )
}
