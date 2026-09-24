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

    ping()
    const iv = setInterval(ping, 20000)
    return () => clearInterval(iv)
  }, [])

  return null
}
