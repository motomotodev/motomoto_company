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
        // El fondo queda limpio si Neon o la red no responden.
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
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setVideoFallido(true)}
        />
      )}
    </div>
  )
}
