'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export type TipoPreferencia = 'restaurante' | 'plato'
export type CalificacionResumen = { promedio: number; cantidad: number; mi_calificacion: number | null }

function clave(tipo: TipoPreferencia, id: string) { return `${tipo}:${id}` }

function lanzarParticulasFavorito(origen?: HTMLElement) {
  if (!origen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const destino = document.querySelector<HTMLElement>('[data-favorites-target]')
  if (!destino) return
  const desde = origen.getBoundingClientRect()
  const hacia = destino.getBoundingClientRect()
  const startX = desde.left + desde.width / 2
  const startY = desde.top + desde.height / 2
  const dx = hacia.left + hacia.width / 2 - startX
  const dy = hacia.top + hacia.height / 2 - startY

  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('span')
    particle.textContent = i % 3 === 0 ? '♥' : '✦'
    Object.assign(particle.style, {
      position: 'fixed', left: `${startX}px`, top: `${startY}px`, zIndex: '9999',
      color: i % 3 === 0 ? '#1877f2' : '#6aa8ff', fontSize: `${12 + Math.random() * 9}px`,
      lineHeight: '1', pointerEvents: 'none', textShadow: '0 0 12px rgba(24,119,242,.9)',
    })
    document.body.appendChild(particle)
    const driftX = (Math.random() - 0.5) * 100
    const driftY = (Math.random() - 0.5) * 100
    const animation = particle.animate([
      { transform: 'translate(-50%, -50%) scale(.25) rotate(0deg)', opacity: 0 },
      { transform: `translate(calc(-50% + ${dx * .48 + driftX}px), calc(-50% + ${dy * .48 + driftY}px)) scale(1.35) rotate(${(Math.random() - .5) * 90}deg)`, opacity: 1, offset: .42 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.12) rotate(${(Math.random() - .5) * 180}deg)`, opacity: 0 },
    ], { duration: 760 + Math.random() * 180, delay: Math.random() * 85, easing: 'cubic-bezier(.16,.74,.28,1)' })
    animation.onfinish = () => particle.remove()
  }
}

export function usePreferenciasCliente() {
  const router = useRouter()
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const [calificaciones, setCalificaciones] = useState<Record<string, CalificacionResumen>>({})
  const [autenticado, setAutenticado] = useState(false)
  const [pendientes, setPendientes] = useState<Set<string>>(new Set())

  const cargar = useCallback(async () => {
    const [favoritosRes, calificacionesRes] = await Promise.all([
      fetch('/api/favoritos', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/calificaciones', { cache: 'no-store' }).then((r) => r.json()),
    ])
    if (favoritosRes.ok) {
      setAutenticado(Boolean(favoritosRes.autenticado))
      setFavoritos(new Set([
        ...(favoritosRes.restaurantes || []).map((id: string) => clave('restaurante', id)),
        ...(favoritosRes.platos || []).map((id: string) => clave('plato', id)),
      ]))
    }
    if (calificacionesRes.ok) {
      setAutenticado(Boolean(calificacionesRes.autenticado) || Boolean(favoritosRes.autenticado))
      const resumen: Record<string, CalificacionResumen> = {}
      for (const row of calificacionesRes.data || []) {
        resumen[clave(row.tipo, row.id)] = {
          promedio: Number(row.promedio || 0),
          cantidad: Number(row.cantidad || 0),
          mi_calificacion: row.mi_calificacion == null ? null : Number(row.mi_calificacion),
        }
      }
      setCalificaciones(resumen)
    }
  }, [])

  useEffect(() => { void cargar().catch(() => {}) }, [cargar])

  const requerirSesion = useCallback(() => {
    const redirect = typeof window === 'undefined' ? '/' : `${window.location.pathname}${window.location.search}`
    router.push(`/login?redirect=${encodeURIComponent(redirect)}`)
  }, [router])

  const toggleFavorito = useCallback(async (tipo: TipoPreferencia, id: string, source?: HTMLElement) => {
    const key = clave(tipo, id)
    if (!autenticado) { requerirSesion(); return }
    if (pendientes.has(key)) return
    const quitar = favoritos.has(key)
    setPendientes((actual) => new Set(actual).add(key))
    try {
      const response = await fetch('/api/favoritos', {
        method: quitar ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, id }),
      })
      const result = await response.json()
      if (response.status === 401) { requerirSesion(); return }
      if (!response.ok || !result.ok) throw new Error(result.error || 'No se pudo actualizar el favorito.')
      setFavoritos((actual) => {
        const next = new Set(actual)
        quitar ? next.delete(key) : next.add(key)
        return next
      })
      if (!quitar) lanzarParticulasFavorito(source)
    } finally {
      setPendientes((actual) => { const next = new Set(actual); next.delete(key); return next })
    }
  }, [autenticado, favoritos, pendientes, requerirSesion])

  const calificar = useCallback(async (tipo: TipoPreferencia, id: string, estrellas: number) => {
    const key = clave(tipo, id)
    if (!autenticado) { requerirSesion(); return }
    if (pendientes.has(key)) return
    setPendientes((actual) => new Set(actual).add(key))
    try {
      const response = await fetch('/api/calificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, id, estrellas }),
      })
      const result = await response.json()
      if (response.status === 401) { requerirSesion(); return }
      if (!response.ok || !result.ok) throw new Error(result.error || 'No se pudo guardar tu calificación.')
      const row = result.data
      setCalificaciones((actual) => ({
        ...actual,
        [key]: { promedio: Number(row.promedio || 0), cantidad: Number(row.cantidad || 0), mi_calificacion: Number(row.mi_calificacion) },
      }))
    } finally {
      setPendientes((actual) => { const next = new Set(actual); next.delete(key); return next })
    }
  }, [autenticado, pendientes, requerirSesion])

  return { favoritos, calificaciones, pendientes, toggleFavorito, calificar, clave }
}

export function FavoritoButton({ active, pending, onClick, compact = false }: { active: boolean; pending?: boolean; onClick: (source: HTMLElement) => void; compact?: boolean }) {
  return <button type="button" aria-pressed={active} aria-label={active ? 'Quitar de favoritos' : 'Agregar a favoritos'} title={active ? 'Quitar de favoritos' : 'Agregar a favoritos'} disabled={pending} onClick={(event) => onClick(event.currentTarget)} className={`mm-favorite-button grid shrink-0 place-items-center rounded-full border transition hover:scale-110 disabled:opacity-50 ${compact ? 'h-9 w-9 text-lg' : 'h-10 w-10 text-xl'} ${active ? 'is-active border-blue-300 bg-blue-500/30 text-[#1877f2] shadow-[0_0_18px_rgba(24,119,242,.42)]' : 'border-white/20 bg-black/50 text-white/85 hover:border-blue-300 hover:bg-blue-500/15 hover:text-[#6aa8ff]'}`}>
    {active ? '♥' : '♡'}
  </button>
}

export function CalificacionEstrellas({ rating, onRate, pending, compact = false }: { rating?: CalificacionResumen; onRate: (stars: number) => void; pending?: boolean; compact?: boolean }) {
  const mi = rating?.mi_calificacion || 0
  return <div className="flex flex-wrap items-center gap-x-2 gap-y-1" aria-label="Califica de una a cinco estrellas">
    <div className="flex items-center" role="group" aria-label="Tu calificación">
      {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" disabled={pending} onClick={() => onRate(star)} aria-label={`Calificar con ${star} ${star === 1 ? 'estrella' : 'estrellas'}`} aria-pressed={mi === star} className={`transition hover:scale-125 disabled:opacity-50 ${compact ? 'px-0.5 text-sm' : 'px-0.5 text-base'} ${star <= mi ? 'text-amber-300' : 'text-white/25 hover:text-amber-200'}`}>★</button>)}
    </div>
    <span className="text-[10px] text-white/55">{mi ? `Tu calificación: ${mi}/5` : 'Califica'}{rating?.cantidad ? ` · ${rating.promedio.toFixed(1)} (${rating.cantidad})` : ''}</span>
  </div>
}
