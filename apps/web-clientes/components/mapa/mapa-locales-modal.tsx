'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

interface Categoria { slug: string; nombre: string; emoji: string | null }
interface LocalMapa {
  id: string; slug: string; nombre: string; subtitulo: string | null
  direccion_fisica: string | null; lat: string | number; lng: string | number
  logo_url: string | null; calificacion: string | number; num_resenas: number
  tiempo_estimado: string | null; categorias: Categoria[]
}
export interface PuntoEntregaMapa { lat: number; lng: number; direccion: string }
interface Props {
  open: boolean
  onClose: () => void
  onConfirmarUbicacion: (punto: PuntoEntregaMapa) => void
  direccionActual?: { lat?: number | string | null; lng?: number | string | null } | null
}

const CENTRO_PUCALLPA: [number, number] = [-8.3791, -74.5539]

function distanciaKm(a: [number, number], b: [number, number]) {
  const rad = Math.PI / 180
  const dLat = (b[0] - a[0]) * rad
  const dLng = (b[1] - a[1]) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(h))
}

function escaparHtml(valor: string) {
  return valor.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

function TarjetaLocal({ local, activo, distancia, onElegir, onClose }: {
  local: LocalMapa; activo: boolean; distancia: number | null; onElegir: () => void; onClose: () => void
}) {
  const rating = Number(local.calificacion)
  return (
    <article className={`rounded-2xl border bg-black/75 p-3 shadow-xl backdrop-blur-xl transition-colors ${activo ? 'border-orange-400' : 'border-white/15 hover:border-white/35'}`}>
      <button type="button" onClick={onElegir} className="flex w-full items-center gap-3 text-left">
        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-white/20 bg-gradient-to-br from-orange-500 to-red-700 text-xl">
          {local.logo_url ? <img src={local.logo_url} alt="" className="h-full w-full object-cover" /> : (local.categorias?.[0]?.emoji || '🏪')}
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block truncate text-sm text-white">{local.nombre}</strong>
          <span className="mt-0.5 block truncate text-[11px] text-gray-300">
            {rating > 0 ? `★ ${rating.toFixed(1)}${local.num_resenas ? ` · ${local.num_resenas} reseñas` : ''}` : 'Restaurante MotoMoto'}
            {local.tiempo_estimado ? ` · ${local.tiempo_estimado}` : ''}{distancia !== null ? ` · ${distancia.toFixed(1)} km` : ''}
          </span>
        </span>
      </button>
      {local.subtitulo && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-300">{local.subtitulo}</p>}
      <div className="mt-3 flex items-center gap-2">
        <Link href={`/restaurante/${local.slug}`} onClick={onClose} className="flex-1 rounded-full bg-brand px-3 py-2 text-center text-xs font-bold text-white transition hover:bg-brand-light">Ver carta</Link>
        {local.direccion_fisica && <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${local.lat},${local.lng}`)}`} target="_blank" rel="noopener noreferrer" aria-label={`Cómo llegar a ${local.nombre}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">↗</a>}
      </div>
    </article>
  )
}

export default function MapaLocalesModal({ open, onClose, onConfirmarUbicacion, direccionActual }: Props) {
  const contenedorMapa = useRef<HTMLDivElement>(null)
  const mapa = useRef<any>(null)
  const leaflet = useRef<any>(null)
  const pinEntrega = useRef<any>(null)
  const pinsLocales = useRef<any[]>([])
  const [locales, setLocales] = useState<LocalMapa[]>([])
  const [cargando, setCargando] = useState(false)
  const [errorLocales, setErrorLocales] = useState(false)
  const [errorMapa, setErrorMapa] = useState(false)
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null)
  const [localActivo, setLocalActivo] = useState<string | null>(null)
  const [punto, setPunto] = useState<[number, number] | null>(null)
  const [ubicando, setUbicando] = useState(false)

  const categorias = useMemo(() => {
    const unicas = new Map<string, Categoria>()
    locales.forEach((local) => (local.categorias || []).forEach((c) => c.slug && !unicas.has(c.slug) && unicas.set(c.slug, c)))
    return [...unicas.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [locales])
  const visibles = useMemo(() => locales.filter((local) => !categoriaActiva || local.categorias?.some((c) => c.slug === categoriaActiva)), [categoriaActiva, locales])
  const distanciaDe = (local: LocalMapa) => punto ? distanciaKm(punto, [Number(local.lat), Number(local.lng)]) : null

  function ponerPin(lat: number, lng: number) {
    setPunto([lat, lng])
    if (!mapa.current || !leaflet.current) return
    const L = leaflet.current
    const posicion = L.latLng(lat, lng)
    if (!pinEntrega.current) {
      pinEntrega.current = L.marker(posicion, {
        draggable: true,
        zIndexOffset: 1000,
        icon: L.divIcon({ className: '', html: '<span class="mm-delivery-pin"><i>⌖</i></span>', iconSize: [42, 48], iconAnchor: [21, 45] }),
      }).addTo(mapa.current)
      pinEntrega.current.on('dragend', () => {
        const pos = pinEntrega.current.getLatLng()
        ponerPin(pos.lat, pos.lng)
      })
    } else pinEntrega.current.setLatLng(posicion)
  }

  useEffect(() => {
    if (!open) return
    setCargando(true)
    setErrorLocales(false)
    fetch('/api/mapa/locales', { cache: 'no-store' })
      .then((r) => r.json())
      .then((result) => { if (!result.ok) throw new Error(); setLocales(result.data as LocalMapa[]) })
      .catch(() => setErrorLocales(true))
      .finally(() => setCargando(false))
  }, [open])

  useEffect(() => {
    if (!open || !contenedorMapa.current || mapa.current) return
    let cancelado = false
    import('leaflet').then((L) => {
      if (cancelado || !contenedorMapa.current) return
      try {
        const instancia = L.map(contenedorMapa.current, { zoomControl: true, attributionControl: true }).setView(CENTRO_PUCALLPA, 13)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          className: 'motomoto-map-tiles',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(instancia)
        instancia.on('click', (e: any) => ponerPin(e.latlng.lat, e.latlng.lng))
        mapa.current = instancia
        leaflet.current = L
        if (direccionActual?.lat != null && direccionActual?.lng != null) {
          const lat = Number(direccionActual.lat)
          const lng = Number(direccionActual.lng)
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            ponerPin(lat, lng)
            instancia.setView([lat, lng], 15)
          }
        }
        const invalidate = () => instancia.invalidateSize({ pan: false })
        requestAnimationFrame(() => requestAnimationFrame(invalidate))
        const observer = new ResizeObserver(invalidate)
        observer.observe(contenedorMapa.current)
        instancia.on('unload', () => observer.disconnect())
      } catch (error) {
        console.error('No se pudo iniciar el mapa de locales:', error)
        setErrorMapa(true)
      }
    }).catch((error) => {
      console.error('No se pudo cargar Leaflet:', error)
      setErrorMapa(true)
    })
    return () => { cancelado = true }
  }, [open, direccionActual])

  useEffect(() => {
    if (!open || !mapa.current || !leaflet.current) return
    const L = leaflet.current
    pinsLocales.current.forEach((pin) => pin.remove())
    pinsLocales.current = []
    visibles.forEach((local, i) => {
      const emoji = escaparHtml(local.categorias?.[0]?.emoji || '🏪')
      const pin = L.marker([Number(local.lat), Number(local.lng)], {
        title: local.nombre,
        icon: L.divIcon({ className: '', html: `<span class="mm-store-pin${local.id === localActivo ? ' is-active' : ''}" style="--pin-index:${i}"><i>${emoji}</i></span>`, iconSize: [42, 48], iconAnchor: [21, 45] }),
      }).addTo(mapa.current)
      pin.on('click', () => {
        setLocalActivo(local.id)
        mapa.current?.flyTo([Number(local.lat), Number(local.lng)], Math.max(mapa.current.getZoom(), 15), { duration: 0.45 })
      })
      pinsLocales.current.push(pin)
    })
  }, [visibles, localActivo, open])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKeyDown) }
  }, [open, onClose])

  useEffect(() => () => {
    mapa.current?.remove()
    mapa.current = null
    leaflet.current = null
    pinEntrega.current = null
    pinsLocales.current = []
  }, [])

  if (!open) return null

  const elegirLocal = (local: LocalMapa) => {
    setLocalActivo(local.id)
    mapa.current?.flyTo([Number(local.lat), Number(local.lng)], Math.max(mapa.current.getZoom(), 15), { duration: 0.45 })
  }
  const usarUbicacion = () => {
    if (!navigator.geolocation) return
    setUbicando(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        ponerPin(coords.latitude, coords.longitude)
        mapa.current?.flyTo([coords.latitude, coords.longitude], 16, { duration: 0.45 })
        setUbicando(false)
      },
      () => setUbicando(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }
  const tarjetas = (mobile = false) => visibles.map((local) => (
    <div key={`${mobile ? 'm' : 'd'}-${local.id}`} onMouseEnter={() => !mobile && elegirLocal(local)}>
      <TarjetaLocal local={local} activo={local.id === localActivo} distancia={distanciaDe(local)} onElegir={() => elegirLocal(local)} onClose={onClose} />
    </div>
  ))

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/65 p-0 backdrop-blur-md md:p-5" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-label="Locales en el mapa" className="flex h-[100dvh] w-full flex-col overflow-hidden border border-white/15 bg-[#08090b]/90 shadow-2xl backdrop-blur-2xl md:h-[min(88dvh,800px)] md:max-w-6xl md:rounded-[28px]">
        <header className="flex items-center justify-between gap-4 px-4 pb-2 pt-[max(14px,env(safe-area-inset-top))] md:px-6 md:pt-5">
          <div><h2 className="motomoto-display text-lg font-black uppercase tracking-wide text-white md:text-xl">Locales en el mapa</h2><p className="text-[11px] text-white/60 md:text-xs">Toca el mapa para marcar dónde entregamos</p></div>
          <button type="button" onClick={onClose} aria-label="Cerrar mapa" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-lg text-white transition hover:rotate-90 hover:bg-white/20">✕</button>
        </header>

        <nav aria-label="Filtrar por categoría" className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] md:px-6">
          <button type="button" onClick={() => setCategoriaActiva(null)} className={`motomoto-display shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${!categoriaActiva ? 'bg-brand text-white shadow-lg shadow-brand/30' : 'bg-white/10 text-white hover:bg-white/20'}`}>📍 Todos</button>
          {categorias.map((c) => <button key={c.slug} type="button" onClick={() => setCategoriaActiva(c.slug)} className={`motomoto-display shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${categoriaActiva === c.slug ? 'bg-brand text-white shadow-lg shadow-brand/30' : 'bg-white/10 text-white hover:bg-white/20'}`}>{c.emoji || '🍽️'} {c.nombre}</button>)}
        </nav>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="hidden min-h-0 flex-col gap-2 overflow-y-auto px-3 pb-3 md:flex">
            {cargando && <p className="p-6 text-center text-sm text-white/60">Cargando locales…</p>}
            {errorLocales && <p className="p-5 text-sm text-red-300">No se pudieron cargar los locales. Puedes marcar tu ubicación en el mapa.</p>}
            {!cargando && !errorLocales && visibles.length === 0 && <p className="p-5 text-sm text-white/60">No hay locales con ubicación registrada en esta categoría.</p>}
            {tarjetas()}
          </aside>
          <div className="relative order-first min-h-[45dvh] min-w-0 bg-[#151719] md:order-none md:min-h-0">
            <div ref={contenedorMapa} className="absolute inset-0 z-0" />
            {errorMapa && <div className="absolute inset-0 z-10 grid place-items-center bg-[#111]/90 p-6 text-center text-sm text-white/70">No se pudo cargar el mapa. Puedes marcar la ubicación desde el GPS y escribir tu dirección.</div>}
            <button type="button" onClick={usarUbicacion} disabled={ubicando} className="absolute right-3 top-3 z-[500] rounded-full border border-white/25 bg-black/75 px-4 py-2.5 text-xs font-bold text-white shadow-lg backdrop-blur-xl transition hover:bg-black disabled:opacity-60">{ubicando ? 'Buscando…' : '📍 Mi ubicación'}</button>
            <div className="absolute bottom-3 left-3 right-3 z-[500] flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] md:hidden">
              {tarjetas(true)}
              {!cargando && visibles.length === 0 && <div className="w-full rounded-2xl border border-white/15 bg-black/75 p-4 text-sm text-white/70 backdrop-blur-xl">{errorLocales ? 'No se pudieron cargar los locales.' : 'No hay locales con ubicación registrada en esta categoría.'}</div>}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-white/10 bg-black/35 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] md:px-6">
          <div className="min-w-0"><p className="motomoto-display truncate text-xs font-bold text-white md:text-sm">📍 {punto ? `${punto[0].toFixed(5)}, ${punto[1].toFixed(5)}` : 'Aún no marcas tu ubicación'}</p><p className="mt-0.5 hidden text-[10px] text-white/50 sm:block">Pulsa el mapa, arrastra el pin o usa el GPS; después podrás escribir la dirección y referencia.</p></div>
          <button type="button" disabled={!punto} onClick={() => punto && onConfirmarUbicacion({ lat: punto[0], lng: punto[1], direccion: '' })} className="motomoto-display shrink-0 rounded-full bg-[#ff7628] px-5 py-3 text-xs font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-[#ff8c45] disabled:cursor-not-allowed disabled:opacity-40 md:px-6">Confirmar entrega</button>
        </footer>
      </section>
    </div>
  )
}
