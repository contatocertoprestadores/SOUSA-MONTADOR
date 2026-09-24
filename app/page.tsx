'use client'
import { useState } from 'react'

const WHATSAPP = '5518991488302'

const servicos = [
  { nome: 'Guarda roupa 2 portas', tempo: '1h', preco: 120, desc: 'Montagem completa de guarda roupa 2 portas', combo: 198 },
  { nome: 'Guarda roupa 3 portas', tempo: '1h30', preco: 130, desc: 'Montagem completa de guarda roupa 3 portas', combo: 216 },
  { nome: 'Guarda roupa 4 portas', tempo: '1h30', preco: 160, desc: 'Montagem completa de guarda roupa 4 portas', combo: 270 },
  { nome: 'Guarda roupa 5 portas', tempo: '1h30', preco: 180, desc: 'Montagem completa de guarda roupa 5 portas', combo: 306 },
  { nome: 'Guarda roupa 6 portas', tempo: '2h30', preco: 200, desc: 'Montagem completa de guarda roupa 6 portas', combo: 342 },
  { nome: 'Guarda roupa 6 portas com espelho', tempo: '2h30', preco: 210, desc: 'Montagem de guarda roupa 6 portas com espelho', combo: 360 },
  { nome: 'Guarda roupa 8 portas', tempo: '2h30', preco: 230, desc: 'Montagem de guarda roupa 8 portas - grande porte', combo: 396 },
  { nome: 'Guarda roupa 2 portas de correr', tempo: '2h30', preco: 250, desc: 'Montagem de guarda roupa 2 portas de correr', combo: 432 },
]

export default function Page() {
  const pedir = (s) => {
    const msg = `Olá! Quero orçamento para: ${s.nome} - R$ ${s.preco},00`
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank')
    fetch('/api/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ servico: s.nome, valor: s.preco, cidade: 'Assis-SP', source: 'site' }) }).catch(()=>{})
  }

  return (
    <main style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      <section style={{ padding: '40px 20px', textAlign: 'center', background: 'linear-gradient(180deg,#1a1a1a,#0a0a0a)' }}>
        <p style={{ color: '#d4af37', fontSize: 12, letterSpacing: 2 }}>ATENDIMENTO PREMIUM EM ASSIS E REGIÃO</p>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 20 }}>PRECISA MONTAR SEU MÓVEL?</h1>
        <p style={{ marginTop: 10, opacity: 0.7 }}>Solicite sua montagem de forma rápida, fácil e segura. Orçamento completo via WhatsApp, sem pagar nada antes.</p>
        <p style={{ marginTop: 10, fontWeight: 700 }}>Você não paga nada antes. Pagamento somente após conclusão • PIX ou dinheiro</p>
        
        <div style={{ marginTop: 30, display: 'inline-block', background: '#7A1F1F', padding: '14px 24px', borderRadius: 12 }}>
          <p>📲 BAIXE NOSSO APP E GANHE</p>
          <p style={{ fontSize: 22, fontWeight: 800 }}>10% DE DESCONTO</p>
        </div>

        <div style={{ marginTop: 30 }}>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" style={{ background: '#25D366', color: '#fff', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', fontWeight: 700 }}>WHATSAPP • ORÇAMENTO GRÁTIS (18) 99148-8302</a>
          <p style={{ marginTop: 10, fontSize: 12, opacity: 0.6 }}>Pague só depois de pronto</p>
        </div>
      </section>

      <section style={{ padding: '30px 20px' }}>
        <h2 style={{ textAlign: 'center', color: '#d4af37', letterSpacing: 2 }}>CATÁLOGO PREMIUM • 88 MONTAGENS + 88 DESMONTAGENS + COMBO 10% OFF</h2>
        <h3 style={{ textAlign: 'center', marginTop: 20, fontSize: 22 }}>Serviços em destaque</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginTop: 20 }}>
          {servicos.map(s => (
            <div key={s.nome} style={{ background: '#1a1a1a', borderRadius: 12, padding: 20, border: '1px solid #222' }}>
              <p style={{ fontSize: 11, opacity: 0.5 }}>GUARDA ROUPAS {s.tempo}</p>
              <h4 style={{ fontWeight: 700, marginTop: 4 }}>{s.nome}</h4>
              <p style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>{s.desc}</p>
              <p style={{ fontSize: 20, fontWeight: 800, marginTop: 10 }}>R$ {s.preco},00</p>
              <p style={{ fontSize: 11, color: '#d4af37' }}>DESMONTAGEM + REMONTAGEM • 10% OFF: R$ {s.combo}</p>
              <button onClick={() => pedir(s)} style={{ width: '100%', marginTop: 12, padding: 12, background: '#fff', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700 }}>SOLICITAR VIA WHATSAPP</button>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '30px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, letterSpacing: 2 }}>AVALIAÇÕES REAIS • MÉDIA 5.0 • 3 avaliações</p>
        <div style={{ marginTop: 20, display: 'grid', gap: 12 }}>
          <div style={{ background: '#1a1a1a', padding: 16, borderRadius: 12 }}>"Serviço impecável! Montou meu guarda-roupa 6 portas super rápido e deixou tudo alinhado. Recomendo!" - Mariana S.</div>
          <div style={{ background: '#1a1a1a', padding: 16, borderRadius: 12 }}>"Profissional pontual, atencioso e preço justo." - Carlos Eduardo</div>
          <div style={{ background: '#1a1a1a', padding: 16, borderRadius: 12 }}>"Meu painel com rack ficou perfeito. Não paguei nada antes." - Ana Paula</div>
        </div>
      </section>

      <footer style={{ padding: 20, textAlign: 'center', opacity: 0.5, fontSize: 12, borderTop: '1px solid #1a1a1a' }}>
        Sousa Montagens - Assis e Tarumã • (18) 99148-8302 • Pague só após o serviço
      </footer>
    </main>
  )
      }
