'use client'
import { useEffect, useState } from 'react'
export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [data, setData] = useState({ onlineCount: 0, online: [], total: 0 })
  useEffect(()=>{ if(localStorage.getItem('sousa_admin')==='ok') setAuthed(true) },[])
  useEffect(()=>{
    if(!authed) return
    const f = async () => { try { const a = await fetch('/api/visitors',{cache:'no-store'}).then(r=>r.json()); setData(a) } catch {} }
    f(); const iv = setInterval(f, 3000); return ()=>clearInterval(iv)
  },[authed])
  if(!authed) return (<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0a0a0a',color:'#fff'}}><div style={{background:'#1a1a1a',padding:30,borderRadius:12,width:320}}><h2>Admin Sousa</h2><input type="password" value={pass} onChange={e=>setPass(e.target.value)} style={{width:'100%',padding:12,background:'#222',color:'#fff'}}/><button onClick={()=>{if(pass==='sousa2024'){localStorage.setItem('sousa_admin','ok'); setAuthed(true)}} } style={{width:'100%',marginTop:10,padding:12,background:'#7A1F1F',color:'#fff',border:'none',borderRadius:8}}>Entrar</button></div></div>)
  return (<div style={{minHeight:'100vh',background:'#0f0f0f',color:'#fff',padding:20}}><h1>📊 {data.onlineCount} online agora</h1><p>Total: {data.total}</p>{data.online.map(o=><div key={o.id}>{o.page} - {o.source}</div>)}</div>)
}
