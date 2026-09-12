'use client'
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const [data, setData] = useState(null)
  const [auth, setAuth] = useState(false)
  const [senha, setSenha] = useState('')

  useEffect(() => {
    if (localStorage.getItem('sousa_admin') === 'liberado') setAuth(true)
  }, [])

  const login = () => {
    if (senha === 'sousa2024') {
      localStorage.setItem('sousa_admin', 'liberado')
      setAuth(true)
    } else {
      alert('Senha incorreta! Use: sousa2024 (você pode mudar no código)')
    }
  }

  useEffect(() => {
    if (!auth) return
    const fetchData = () => {
      fetch('/api/visitors')
        .then(r => r.json())
        .then(setData)
        .catch(console.error)
    }
    fetchData()
    const i = setInterval(fetchData, 3000) // atualiza a cada 3s
    return () => clearInterval(i)
  }, [auth])

  if (!auth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f', color: '#fff' }}>
        <div style={{ background: '#1a1a1a', padding: 32, borderRadius: 16, width: 360 }}>
          <h2 style={{ margin: 0, marginBottom: 8 }}>🔒 Painel Sousa Montagens</h2>
          <p style={{ opacity: 0.6, fontSize: 14 }}>Digite a senha do ADM</p>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            placeholder="Senha"
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #333', background: '#111', color: '#fff', marginTop: 12 }}
          />
          <button onClick={login} style={{ width: '100%', marginTop: 12, padding: 12, background: '#ff6b00', color: '#fff', border: 0, borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>
            Entrar
          </button>
          <p style={{ fontSize: 12, opacity: 0.4, marginTop: 12 }}>Senha padrão: sousa2024 - troque no arquivo app/admin/page.jsx linha 22</p>
        </div>
      </div>
    )
  }

  if (!data) return <div style={{ padding: 40, background: '#0f0f0f', color: '#fff', minHeight: '100vh' }}>Carregando...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', padding: 24, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1>🔧 Sousa Montagens - ADM Tempo Real</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ background: '#1a1a1a', padding: '6px 12px', borderRadius: 20, fontSize: 12 }}>Atualizando a cada 3s</span>
            <button onClick={() => { localStorage.removeItem('sousa_admin'); location.reload() }} style={{ background: '#333', color: '#fff', border: 0, padding: '6px 12px', borderRadius: 20, cursor: 'pointer' }}>Sair</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <Card titulo="🟢 ONLINE AGORA" valor={data.online} cor="#00ff88" pulsando />
          <Card titulo="👁️ HOJE" valor={data.hoje} cor="#ff6b00" />
          <Card titulo="📅 SEMANA" valor={data.semana} cor="#3b82f6" />
          <Card titulo="📊 TOTAL GERAL" valor={data.total} cor="#a855f7" />
          <Card titulo="📲 DOWNLOADS APK" valor={data.apkDownloads} cor="#fff" />
        </div>

        <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 20 }}>
          <h3 style={{ marginTop: 0 }}>Visitantes Online Agora ({data.visitantes.length})</h3>
          {data.visitantes.length === 0 && <p style={{ opacity: 0.5 }}>Nenhum visitante online no momento. Abra o site em outra aba para testar.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.visitantes.map((v, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: '#222', padding: 12, borderRadius: 10, fontSize: 14 }}>
                <div>
                  <b>{v.cidade}</b> • {v.dispositivo} <span style={{ opacity: 0.5 }}>• {v.ip}</span>
                  <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>{v.pagina}</div>
                </div>
                <div style={{ opacity: 0.5, fontSize: 12 }}>
                  {Math.floor((Date.now() - v.timestamp) / 1000)}s atrás
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16, opacity: 0.4, fontSize: 12 }}>
          Link do seu APK: https://sousamontador.vercel.app/sousa-montagens.apk • Última atualização: {new Date(data.timestamp).toLocaleTimeString('pt-BR')}
        </div>
      </div>
    </div>
  )
}

function Card({ titulo, valor, cor, pulsando }) {
  return (
    <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 20, borderLeft: `4px solid ${cor}` }}>
      <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
        {pulsando && <span style={{ width: 8, height: 8, background: cor, borderRadius: '50%', display: 'inline-block', boxShadow: `0 0 8px ${cor}` }}></span>}
        {titulo}
      </div>
      <div style={{ fontSize: 36, fontWeight: 900, marginTop: 8, color: cor }}>{valor}</div>
    </div>
  )
}