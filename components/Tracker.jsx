'use client'
import { useEffect, useState } from 'react'

export default function Tracker() {
  useEffect(() => {
    const sendTrack = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pagina: window.location.pathname + window.location.search,
          dispositivo: isMobile ? 'Mobile' : 'Desktop'
        })
      }).catch(() => {})
    }

    sendTrack()
    // Reenvia a cada 45 segundos enquanto estiver na página
    const interval = setInterval(sendTrack, 45000)
    return () => clearInterval(interval)
  }, [])

  return null
}