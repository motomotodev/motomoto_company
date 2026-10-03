'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  CalificacionEstrellas,
  FavoritoButton,
  type CalificacionResumen,
  type TipoPreferencia,
} from '@/components/ui/preferencias-cliente'
import type { PlatoHome, RestauranteHome } from './home-restaurantes'

interface Props {
  restaurante: RestauranteHome
  open: boolean
  onClose: () => void
  categorias: { id: string; nombre: string; emoji: string }[]
  subcategoria: string | null
  onSelectCategory: (id: string | null) => void
  platos: PlatoHome[]
  favoritos: Set<string>
  calificaciones: Record<string, CalificacionResumen>
  pendientes: Set<string>
  toggleFavorito: (tipo: TipoPreferencia, id: string, source?: HTMLElement) => Promise<void>
  calificar: (tipo: TipoPreferencia, id: string, estrellas: number) => Promise<void>
  clave: (tipo: TipoPreferencia, id: string) => string
  onAgregar: (plato: PlatoHome) => void
  onOpenOrder: () => void
}

const formatoSoles = (valor: string | number) => `S/ ${Number(valor || 0).toFixed(2)}`

export default function RestaurantMenuOverlay({
  restaurante,
  open,
  onClose,
  categorias,
  subcategoria,
  onSelectCategory,
  platos,
  favoritos,
  calificaciones,
  pendientes,
  toggleFavorito,
  calificar,
  clave,
  onAgregar,
  onOpenOrder,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const pointerStart = useRef<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(4)
  const [slide, setSlide] = useState(0)
  const [offset, setOffset] = useState(0)
  const maxSlide = Math.max(0, platos.length - visibleCount)

  useEffect(() => {
    if (!open || !stageRef.current) return
    const stage = stageRef.current
    const updateVisibleCount = () => {
      const value = Number.parseInt(getComputedStyle(stage).getPropertyValue('--visible'), 10)
      setVisibleCount(Number.isFinite(value) && value > 0 ? value : 4)
    }
    updateVisibleCount()
    const observer = new ResizeObserver(updateVisibleCount)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [open])

  useEffect(() => {
    if (!open) return
    setSlide((current) => Math.min(current, Math.max(0, platos.length - visibleCount)))
    const frame = requestAnimationFrame(() => {
      const card = trackRef.current?.children.item(slide) as HTMLElement | null
      setOffset(card?.offsetLeft || 0)
    })
    return () => cancelAnimationFrame(frame)
  }, [open, slide, visibleCount, platos])

  if (!open) return null

  const move = (direction: number) => setSlide((current) => Math.max(0, Math.min(maxSlide, current + direction)))
  const shownFrom = platos.length ? slide + 1 : 0
  const shownTo = Math.min(slide + visibleCount, platos.length)
  const progressWidth = (Math.min(visibleCount, platos.length) / Math.max(platos.length, 1)) * 100
  const progressLeft = (slide / Math.max(platos.length, 1)) * 100

  return (
    <section className="mm-home-menu-overlay absolute inset-0 z-20 flex min-h-0 flex-col overflow-hidden rounded-[inherit] border border-white/15 p-4 text-white shadow-2xl sm:p-6" aria-label={`Carta de ${restaurante.nombre}`}>
      <header className="mm-home-menu-header flex shrink-0 items-center gap-3 pb-3">
        <button type="button" onClick={onClose} className="mm-home-menu-back shrink-0" aria-label="Volver al plato destacado"><span aria-hidden="true">‹</span><span>Volver</span></button>
        <div className="mm-home-menu-logo grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-white/35 bg-white/10 text-2xl shadow-lg">
          {restaurante.logo_url ? <img src={restaurante.logo_url} alt="" className="h-full w-full object-contain" /> : <span>{restaurante.categorias[0]?.emoji || '🍽️'}</span>}
        </div>
        <div className="mm-home-menu-title min-w-0 flex-1">
          <span className="mm-home-menu-tag">{restaurante.subtitulo || restaurante.categorias[0]?.nombre || 'Carta completa'}</span>
          <h2 className="truncate">{restaurante.nombre}</h2>
          <small>★ {Number(restaurante.calificacion || 0).toFixed(1)} · {restaurante.tiempo_estimado || 'Tiempo por confirmar'} · {restaurante.direccion_fisica || 'Pucallpa'}</small>
        </div>
        <button type="button" onClick={onOpenOrder} aria-label="Mi pedido" title="Mi pedido" className="mm-home-menu-cart shrink-0">🛒 <span>Mi pedido</span></button>
      </header>

      {categorias.length > 0 && <nav className="mm-home-menu-categories flex shrink-0 gap-2 overflow-x-auto py-3" role="tablist" aria-label="Categorías de la carta">
        <button type="button" role="tab" aria-selected={!subcategoria} onClick={() => onSelectCategory(null)} className={!subcategoria ? 'is-active' : ''}><span>🍽️</span> Todos <em>{restaurante.platos.length}</em></button>
        {categorias.map((category) => <button key={category.id} type="button" role="tab" aria-selected={subcategoria === category.id} onClick={() => onSelectCategory(category.id)} className={subcategoria === category.id ? 'is-active' : ''}><span>{category.emoji}</span> {category.nombre} <em>{restaurante.platos.filter((item) => item.subcategoria_id === category.id).length}</em></button>)}
      </nav>}

      <div className="mm-home-menu-stage" ref={stageRef}>
        <button type="button" className="mm-home-menu-arrow is-left" onClick={() => move(-1)} disabled={slide <= 0} aria-label="Productos anteriores">‹</button>
        <div className="mm-home-menu-view" onPointerDown={(event) => { pointerStart.current = event.clientX }} onPointerUp={(event) => { if (pointerStart.current === null) return; const delta = event.clientX - pointerStart.current; pointerStart.current = null; if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1) }}>
          <div className="mm-home-menu-track" ref={trackRef} style={{ transform: `translateX(-${offset}px)` }}>
            {platos.map((item, index) => {
              const itemKey = clave('plato', item.id)
              return <article key={item.id} className="mm-home-menu-product" style={{ '--card-index': index } as CSSProperties & { '--card-index': number }}>
                <span className="mm-home-menu-product-image">
                  {item.imagen_url ? <img src={item.imagen_url} alt="" /> : <span>{restaurante.categorias[0]?.emoji || '🍽️'}</span>}
                </span>
                <span className="mm-home-menu-time">◷ {item.tiempo_estimado ? `${item.tiempo_estimado} min` : restaurante.tiempo_estimado || '—'}</span>
                <h3>{item.nombre}</h3>
                <p>{item.descripcion || `Preparado al momento en ${restaurante.nombre}.`}</p>
                <div className="mm-home-menu-price-row">
                  <div className="mm-home-menu-price"><small>Precio</small><strong>{formatoSoles(item.precio)}</strong></div>
                  <FavoritoButton compact active={favoritos.has(itemKey)} pending={pendientes.has(itemKey)} onClick={(source) => void toggleFavorito('plato', item.id, source).catch((error) => window.alert(error instanceof Error ? error.message : 'No se pudo actualizar el favorito.'))} />
                </div>
                <div className="mm-home-menu-rating"><CalificacionEstrellas compact rating={calificaciones[itemKey]} pending={pendientes.has(itemKey)} onRate={(stars) => void calificar('plato', item.id, stars).catch((error) => window.alert(error instanceof Error ? error.message : 'No se pudo guardar tu calificación.'))} /></div>
                <button type="button" className="mm-home-menu-add" disabled={!restaurante.abierto || !item.disponible} onClick={() => onAgregar(item)}><span>{!restaurante.abierto ? 'Cerrado' : item.disponible ? 'Agregar' : 'Agotado'}</span><i>{item.disponible && restaurante.abierto ? '+' : '×'}</i></button>
              </article>
            })}
          </div>
        </div>
        <button type="button" className="mm-home-menu-arrow is-right" onClick={() => move(1)} disabled={slide >= maxSlide} aria-label="Más productos">›</button>
      </div>

      {platos.length === 0 ? <p className="mm-home-menu-empty">Aún no hay productos en esta categoría.</p> : <footer className="mm-home-menu-footer"><div className="mm-home-menu-progress"><span style={{ width: `${progressWidth}%`, left: `${progressLeft}%` }} /></div><span>{shownFrom}–{shownTo} de {platos.length} productos</span></footer>}
    </section>
  )
}
