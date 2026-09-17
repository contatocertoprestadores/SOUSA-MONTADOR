'use client'
import { useEffect } from 'react'

export default function Tracker() {
  useEffect(() => {
    const getId = () => {
      try {
        let id = localStorage.getItem('sousa_id')
        if (!id) {
          id = Math.random().toString(36).slice(2) + Date.now().toString(36)
          localStorage.setItem('sousa_id', id)
        }
        return id
      } catch {
        return Math.random().toString(36).slice(2)
      }
    }

    const ping = async () => {
      try {
        await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: getId(), 
            page: window.location.pathname || '/', 
            source: 'site',
            city: 'Assis-SP'
          }),
          cache: 'no-store',
          keepalive: true
        })
      } catch {}
    }

    // ping imediato + a cada 20s
    ping()
    const interval = setInterval(ping, 20000)
    const onFocus = () => ping()
    const onVis = () => { if (document.visibilityState === 'visible') ping() }
    
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVis)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return null // NÃO RENDERIZA NADA - NÃO ALTERA LAYOUT
}
