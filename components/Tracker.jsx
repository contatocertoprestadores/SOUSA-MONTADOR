'use client'
import { useEffect } from 'react'

export default function Tracker() {
  useEffect(() => {
    const getId = () => {
      let id = ''
      try { id = localStorage.getItem('sousa_id') || '' } catch {}
      if (!id) {
        id = Math.random().toString(36).slice(2) + Date.now().toString(36)
        try { localStorage.setItem('sousa_id', id) } catch {}
      }
      return id
    }
    const ping = async () => {
      try {
        await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: getId(), page: window.location.pathname, source: 'site' }),
          cache: 'no-store',
          keepalive: true
        })
      } catch {}
    }
    ping()
    const i = setInterval(ping, 20000)
    const onFocus = () => ping()
    window.addEventListener('focus', onFocus)
    return () => { clearInterval(i); window.removeEventListener('focus', onFocus) }
  }, [])
  return null
}
