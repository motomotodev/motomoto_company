'use client'

import { useEffect, useState } from 'react'

type TipoVideo = 'WEB' | 'MOVIL'
type VideosFondo = Record<TipoVideo, string | null>

const VACIO: VideosFondo = { WEB: null, MOVIL: null }

export default function FondoDecorativo() {
  const [videos, setVideos] = useState<VideosFondo>(VACIO)
  const [tipo, setTipo] = useState<TipoVideo | null>(null)
  const [movimientoReducido, setMovimientoReducido] = useState(true)
  const [videoFallido, setVideoFallido] = useState(false)

  useEffect(() => {
    let activo = true
    fetch('/api/videos-fondo/activo', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => {
        if (activo && result?.ok && result.data) setVideos(result.data as VideosFondo)
      })
      .catch(() => {
        // Si Neon o la red no responden, se conservan las decoraciones estáticas.
      })
    return () => { activo = false }
  }, [])

  useEffect(() => {
    const pantalla = window.matchMedia('(max-width: 767px)')
    const movimiento = window.matchMedia('(prefers-reduced-motion: reduce)')
    const actualizar = () => {
      setTipo(pantalla.matches ? 'MOVIL' : 'WEB')
      setMovimientoReducido(movimiento.matches)
    }
    actualizar()
    pantalla.addEventListener('change', actualizar)
    movimiento.addEventListener('change', actualizar)
    return () => {
      pantalla.removeEventListener('change', actualizar)
      movimiento.removeEventListener('change', actualizar)
    }
  }, [])

  const src = tipo ? videos[tipo] : null

  useEffect(() => setVideoFallido(false), [src])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {src && !movimientoReducido && !videoFallido && (
        <video
          key={`${tipo}-${src}`}
          src={src}
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setVideoFallido(true)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-dark/25 via-surface-dark/55 to-surface-dark/85" />

      {/* Motivos decorativos de MotoMoto; permanecen visibles si el video no carga o se reduce el movimiento. */}
      <svg className="absolute left-[5%] top-[8%] h-24 w-24 text-brand opacity-[0.07]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 22h20L12 2zm0 4l6 12H6l6-12z" />
      </svg>
      <svg className="absolute right-[8%] top-[20%] h-20 w-20 text-brand opacity-[0.07]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 10V8h-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v6a4 4 0 004 4h2v4h2v-4h2a4 4 0 004-4h2a2 2 0 002-2zm-2 0h-2v-2h2v2zM4 6h12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
      </svg>
      <svg className="absolute bottom-[15%] left-[10%] h-24 w-24 text-brand opacity-[0.07]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 8h1a4 4 0 010 8h-1v2H4V8h14zm0 2v4h1a2 2 0 000-4h-1zM2 20h20v2H2z" />
      </svg>
      <svg className="absolute bottom-[25%] right-[12%] h-28 w-28 text-brand opacity-[0.06]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
      </svg>
      <svg className="absolute left-[45%] top-[45%] hidden h-32 w-32 text-brand opacity-[0.05] md:block" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8 2 5 5 5 9h14c0-4-3-7-7-7zM5 11v2h14v-2H5zM5 15v2h14v-2H5zM5 19h14v2H5z" />
      </svg>
      <svg className="absolute left-[25%] top-[70%] h-20 w-20 text-brand opacity-[0.06]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 8h1a4 4 0 010 8h-1v2H4V8h14zm0 2v4h1a2 2 0 000-4h-1zM2 20h20v2H2z" />
      </svg>
      <svg className="absolute right-[35%] top-[12%] h-16 w-16 text-brand opacity-[0.06]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 6V4a4 4 0 00-8 0v2H2v16h20V6h-6zM10 4a2 2 0 014 0v2h-4V4z" />
      </svg>
      <svg className="absolute left-[35%] top-[4%] h-20 w-20 text-brand opacity-[0.05]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6 2 2 6 2 12s4 10 10 10 10-4 10-10S18 2 12 2zm0 18c-4 0-8-4-8-8s4-8 8-8 8 4 8 8-4 8-8 8z" />
        <path d="M12 6v12M8 10l4-4 4 4M8 14l4 4 4-4" stroke="currentColor" fill="none" strokeWidth="0.5" />
      </svg>
      <svg className="absolute bottom-[3%] left-[55%] h-24 w-24 text-brand opacity-[0.05]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6 2 2 6 2 12s4 10 10 10 10-4 10-10S18 2 12 2zm0 18c-4 0-8-4-8-8s4-8 8-8 8 4 8 8-4 8-8 8z" />
        <path d="M12 6v12M8 10l4-4 4 4M8 14l4 4 4-4" stroke="currentColor" fill="none" strokeWidth="0.5" />
      </svg>
      <svg className="absolute left-[3%] top-[55%] h-28 w-28 text-brand opacity-[0.05]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8 2 4 6 4 10c0 3 1 5 3 6l-1 4h2l1-3c1 .5 2 .5 3 0l1 3h2l-1-4c2-1 3-3 3-6 0-4-4-8-8-8z" />
      </svg>
      <svg className="absolute bottom-0 left-0 h-32 w-full text-brand opacity-[0.05]" viewBox="0 0 1440 150" preserveAspectRatio="none" fill="none">
        <path d="M0,80 C240,120 480,40 720,80 C960,120 1200,40 1440,80" stroke="currentColor" strokeWidth="2" />
        <path d="M0,100 C240,140 480,60 720,100 C960,140 1200,60 1440,100" stroke="currentColor" strokeWidth="1.5" />
        <path d="M0,120 C240,160 480,80 720,120 C960,160 1200,80 1440,120" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  )
}