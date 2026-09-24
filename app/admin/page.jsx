'use client'
import { useEffect, useState } from 'react'

export default function AdminPage(){
  const [authed,setAuthed]=useState(false)
  const [pass,setPass]=useState('')
  const [data,setData]=useState({onlineCount:0,online:[],total:0})
  const [pedidos,setPedidos]=useState({pedidos:[],total:0})

  useEffect(()=>{ if(localStorage.getItem('sousa_admin')==='ok') setAuthed(true)},[])

  useEffect(()=>{
    if(!authed) return
    const f=async()=>{
      try{
        const [a,b]=await Promise.all([
          fetch('/api/visitors',{cache:'no-store'}).then(r=>r.json()).catch(()=>({onlineCount:0,online:[],total:0})),
          fetch('/api/pedidos',{cache:'no-store'}).then(r=>r.json()).catch(()=>({pedidos:[],total:0}))
        ])
        setData(a)
        setPedidos(b)
      }catch{}
    }
    f()
    const iv=setInterval(f,3000)
    return()=>clearInterval(iv)
  },[authed])

  if(!authed) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0a0a0a',color:'#fff'}}>
      <div style={{background:'#1a1a1a',padding:30,borderRadius:12,width:320}}>
        <h2>Admin Sousa</h2>
        <input type="password" placeholder="Senha" value={pass} onChange={e=>setPass(e.target.value)} style={{width:'100%',padding:12,borderRadius:8,background:'#222',color:'#fff',border:'1px solid #333'}}/>
        <button onClick={()=>{if(pass==='sousa2024'){localStorage.setItem('sousa_admin','ok'); setAuthed(true)}else alert('Senha errada')}} style={{width:'100%',marginTop:10,padding:12,background:'#7A1F1F',color:'#fff',border:'none',borderRadius:8}}>Entrar</button>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0f0f0f',color:'#fff',padding:20}}>
      <h1>📊 Tempo Real - {data.onlineCount} online</h1>
      <p>Total visitas: {data.total} | Pedidos: {pedidos.total}</p>
      <div style={{marginTop:20,background:'#1a1a1a',padding:20,borderRadius:12}}>
        {data.online.length===0
         ?<p>Nenhum online. Abra o site em outra aba.</p>
          :data.online.map(o=><div key={o.id} style={{padding:'8px 0',borderBottom:'1px solid #222'}}>{o.page} - {o.source} - {Math.round((Date.now()-o.lastSeen)/1000)}s atrás</div>)
        }
      </div>
    </div>
  )
}
