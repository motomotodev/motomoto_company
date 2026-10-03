'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface Categoria { slug: string; nombre: string; emoji: string | null }
interface LocalMapa {
  id: string; slug: string; nombre: string; subtitulo: string | null
  direccion_fisica: string | null; lat: string | number; lng: string | number
  logo_url: string | null; calificacion: string | number; num_resenas: number
  tiempo_estimado: string | null; categorias: Categoria[]
}
export interface PuntoEntregaMapa {
  id?: string
  lat: number
  lng: number
  direccion: string
  referencia: string
  etiqueta: string
  es_predeterminada?: boolean
}
interface Props {
  open: boolean
  onClose: () => void
  onConfirmarUbicacion: (punto: PuntoEntregaMapa) => Promise<void>
  direccionActual?: Partial<PuntoEntregaMapa> | null
  modoEdicion?: boolean
  mostrarDirecciones?: boolean
  vistaInicial?: 'locales' | 'direcciones'
  onDireccionSeleccionada?: () => void
}

type DireccionGuardada = PuntoEntregaMapa & { es_predeterminada: boolean; creado_en?: string }

const CENTRO_PUCALLPA: [number, number] = [-8.3791, -74.5539]

function coordenadasValidas(lat: unknown, lng: unknown): [number, number] | null {
  if (lat == null || lng == null || (typeof lat === 'string' && !lat.trim()) || (typeof lng === 'string' && !lng.trim())) return null
  const latitude = Number(lat)
  const longitude = Number(lng)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null
  return [latitude, longitude]
}

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

export default function MapaLocalesModal({ open, onClose, onConfirmarUbicacion, direccionActual, modoEdicion = false, mostrarDirecciones = false, vistaInicial = 'locales', onDireccionSeleccionada }: Props) {
  const contenedorMapa = useRef<HTMLDivElement>(null)
  const mapa = useRef<any>(null)
  const leaflet = useRef<any>(null)
  const direccionActualRef = useRef(direccionActual)
  direccionActualRef.current = direccionActual
  const pinEntrega = useRef<any>(null)
  const pinsLocales = useRef<any[]>([])
  const puedeCambiarPinRef = useRef(false)
  const [locales, setLocales] = useState<LocalMapa[]>([])
  const [cargando, setCargando] = useState(false)
  const [errorLocales, setErrorLocales] = useState(false)
  const [errorMapa, setErrorMapa] = useState(false)
  const [mapaListo, setMapaListo] = useState(false)
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null)
  const [localActivo, setLocalActivo] = useState<string | null>(null)
  const [punto, setPunto] = useState<[number, number] | null>(null)
  const [ubicando, setUbicando] = useState(false)
  const [capturandoDireccion, setCapturandoDireccion] = useState(false)
  const [direccionTexto, setDireccionTexto] = useState('')
  const [referencia, setReferencia] = useState('')
  const [etiqueta, setEtiqueta] = useState('Casa')
  const [guardando, setGuardando] = useState(false)
  const [errorEntrega, setErrorEntrega] = useState<string | null>(null)
  const [vista, setVista] = useState<'locales' | 'direcciones'>('locales')
  const [direcciones, setDirecciones] = useState<DireccionGuardada[]>([])
  const [cargandoDirecciones, setCargandoDirecciones] = useState(false)
  const [direccionEnEdicion, setDireccionEnEdicion] = useState<DireccionGuardada | null>(null)
  const [accionDireccion, setAccionDireccion] = useState<string | null>(null)
  const puedeCambiarPin = vista === 'locales' || capturandoDireccion
  puedeCambiarPinRef.current = puedeCambiarPin

  const cargarDirecciones = useCallback(async () => {
    if (!mostrarDirecciones) return
    setCargandoDirecciones(true)
    try {
      const response = await fetch('/api/direcciones', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok || !result.ok) throw new Error(result.error || 'No se pudieron cargar las direcciones.')
      const guardadas = result.data || []
      setDirecciones(guardadas)
      if (vistaInicial === 'direcciones' && guardadas.length === 0) setVista('locales')
    } catch (error) {
      setErrorEntrega(error instanceof Error ? error.message : 'No se pudieron cargar las direcciones.')
    } finally {
      setCargandoDirecciones(false)
    }
  }, [mostrarDirecciones, vistaInicial])

  const categorias = useMemo(() => {
    const unicas = new Map<string, Categoria>()
    locales.forEach((local) => (local.categorias || []).forEach((c) => c.slug && !unicas.has(c.slug) && unicas.set(c.slug, c)))
    return [...unicas.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [locales])
  const visibles = useMemo(() => {
    const filtrados = locales.filter((local) => coordenadasValidas(local.lat, local.lng) && (!categoriaActiva || local.categorias?.some((c) => c.slug === categoriaActiva)))
    if (!punto) return filtrados
    return [...filtrados].sort((a, b) => distanciaKm(punto, coordenadasValidas(a.lat, a.lng)!) - distanciaKm(punto, coordenadasValidas(b.lat, b.lng)!))
  }, [categoriaActiva, locales, punto])
  const distanciaDe = (local: LocalMapa) => {
    const coords = coordenadasValidas(local.lat, local.lng)
    return punto && coords ? distanciaKm(punto, coords) : null
  }

  const ponerPin = useCallback((lat: number, lng: number) => {
    const coords = coordenadasValidas(lat, lng)
    if (!coords) return
    setPunto(coords)
    if (!mapa.current || !leaflet.current) return
    const L = leaflet.current
    const posicion = L.latLng(coords[0], coords[1])
    if (!pinEntrega.current) {
      pinEntrega.current = L.marker(posicion, {
        draggable: puedeCambiarPinRef.current,
        zIndexOffset: 1000,
        icon: L.divIcon({ className: '', html: '<span class="mm-delivery-pin"><i>🏠</i></span>', iconSize: [42, 48], iconAnchor: [21, 45] }),
      }).addTo(mapa.current)
      pinEntrega.current.on('dragend', () => {
        const pos = pinEntrega.current.getLatLng()
        setPunto([pos.lat, pos.lng])
      })
    } else pinEntrega.current.setLatLng(posicion)
  }, [])

  useEffect(() => {
    if (!open) return
    setVista(mostrarDirecciones ? vistaInicial : 'locales')
    setDireccionEnEdicion(null)
    setCapturandoDireccion(false)
    setDireccionTexto(direccionActual?.direccion || '')
    setReferencia(direccionActual?.referencia || '')
    setEtiqueta(direccionActual?.etiqueta || 'Casa')
    setErrorEntrega(null)
  }, [open, direccionActual, mostrarDirecciones, vistaInicial])

  useEffect(() => {
    const dragging = pinEntrega.current?.dragging
    if (!dragging) return
    if (puedeCambiarPin) dragging.enable()
    else dragging.disable()
  }, [puedeCambiarPin, mapaListo])

  useEffect(() => {
    if (open && mostrarDirecciones) void cargarDirecciones()
  }, [open, mostrarDirecciones, cargarDirecciones])

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
    if (!open || !mapa.current || !leaflet.current) return
    const coords = coordenadasValidas(direccionActual?.lat, direccionActual?.lng)
    if (!coords) return
    const instancia = mapa.current
    let primerFrame = 0
    let segundoFrame = 0
    primerFrame = requestAnimationFrame(() => {
      segundoFrame = requestAnimationFrame(() => {
        if (mapa.current !== instancia) return
        try {
          instancia.invalidateSize({ pan: false })
          ponerPin(coords[0], coords[1])
          instancia.flyTo(coords, 15, { duration: 0.45 })
        } catch (error) {
          console.error('No se pudo centrar el mapa en la dirección guardada:', error)
        }
      })
    })
    return () => {
      cancelAnimationFrame(primerFrame)
      cancelAnimationFrame(segundoFrame)
    }
  }, [open, direccionActual, ponerPin])

  useEffect(() => {
    if (!open || !contenedorMapa.current || mapa.current) return
    let cancelado = false
    let instancia: any = null
    let observer: ResizeObserver | null = null
    let primerFrame = 0
    let segundoFrame = 0
    import('leaflet').then((L) => {
      if (cancelado || !contenedorMapa.current) return
      try {
        setErrorMapa(false)
        instancia = L.map(contenedorMapa.current, { zoomControl: true, attributionControl: true }).setView(CENTRO_PUCALLPA, 13)
        mapa.current = instancia
        leaflet.current = L
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          className: 'motomoto-map-tiles',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(instancia)
        instancia.on('click', (e: any) => {
          if (puedeCambiarPinRef.current) ponerPin(e.latlng.lat, e.latlng.lng)
        })
        const invalidarTamano = () => {
          if (!cancelado && mapa.current === instancia) instancia.invalidateSize({ pan: false })
        }
        observer = new ResizeObserver(invalidarTamano)
        observer.observe(contenedorMapa.current)
        primerFrame = requestAnimationFrame(() => {
          segundoFrame = requestAnimationFrame(() => {
            if (cancelado || mapa.current !== instancia) return
            invalidarTamano()
            const coordsDireccion = coordenadasValidas(direccionActualRef.current?.lat, direccionActualRef.current?.lng)
            if (coordsDireccion) {
              ponerPin(coordsDireccion[0], coordsDireccion[1])
              instancia.setView(coordsDireccion, 15, { animate: false })
            }
            setMapaListo(true)
          })
        })
      } catch (error) {
        console.error('No se pudo iniciar el mapa de locales:', error)
        setErrorMapa(true)
      }
    }).catch((error) => {
      console.error('No se pudo cargar Leaflet:', error)
      setErrorMapa(true)
    })
    return () => {
      cancelado = true
      cancelAnimationFrame(primerFrame)
      cancelAnimationFrame(segundoFrame)
      observer?.disconnect()
      if (instancia) {
        instancia.remove()
        if (mapa.current === instancia) {
          mapa.current = null
          leaflet.current = null
          pinEntrega.current = null
          pinsLocales.current = []
        }
      }
      setMapaListo(false)
    }
  }, [open, ponerPin])

  useEffect(() => {
    if (!open || !mapaListo || !mapa.current || !leaflet.current) return
    const L = leaflet.current
    pinsLocales.current.forEach((pin) => pin.remove())
    pinsLocales.current = []
    visibles.forEach((local, i) => {
      const emoji = escaparHtml(local.categorias?.[0]?.emoji || '🏪')
      const coords = coordenadasValidas(local.lat, local.lng)
      if (!coords) return
      const pin = L.marker(coords, {
        title: local.nombre,
        icon: L.divIcon({ className: '', html: `<span class="mm-store-pin${local.id === localActivo ? ' is-active' : ''}" style="--pin-index:${i}"><i>${emoji}</i></span>`, iconSize: [42, 48], iconAnchor: [21, 45] }),
      }).addTo(mapa.current)
      pin.on('click', () => {
        setLocalActivo(local.id)
        const zoomActual = Number(mapa.current?.getZoom())
        mapa.current?.flyTo(coords, Number.isFinite(zoomActual) ? Math.max(zoomActual, 15) : 15, { duration: 0.45 })
      })
      pinsLocales.current.push(pin)
    })
  }, [visibles, localActivo, open, mapaListo])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKeyDown) }
  }, [open, onClose])

  if (!open) return null

  const elegirLocal = (local: LocalMapa) => {
    setLocalActivo(local.id)
    const coords = coordenadasValidas(local.lat, local.lng)
    if (!coords || !mapa.current) return
    const zoomActual = Number(mapa.current.getZoom())
    mapa.current.flyTo(coords, Number.isFinite(zoomActual) ? Math.max(zoomActual, 15) : 15, { duration: 0.45 })
  }
  const usarUbicacion = () => {
    if (!navigator.geolocation) return
    setUbicando(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const posicion = coordenadasValidas(coords.latitude, coords.longitude)
        if (posicion) {
          ponerPin(posicion[0], posicion[1])
          mapa.current?.flyTo(posicion, 16, { duration: 0.45 })
        }
        setUbicando(false)
      },
      () => setUbicando(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const guardarDireccion = async () => {
    if (!punto) return setErrorEntrega('Marca tu ubicación en el mapa o usa el GPS.')
    if (direccionTexto.trim().length < 3) return setErrorEntrega('Escribe la dirección donde recibirás el pedido.')
    if (!etiqueta.trim()) return setErrorEntrega('Elige un nombre para guardar esta dirección.')

    setErrorEntrega(null)
    setGuardando(true)
    try {
      await onConfirmarUbicacion({
        id: direccionEnEdicion?.id ?? direccionActual?.id,
        lat: punto[0], lng: punto[1], direccion: direccionTexto.trim(),
        referencia: referencia.trim(), etiqueta: etiqueta.trim(),
        es_predeterminada: direccionEnEdicion?.es_predeterminada ?? true,
      })
      if (mostrarDirecciones) {
        setDireccionEnEdicion(null)
        setCapturandoDireccion(false)
        setVista('direcciones')
        await cargarDirecciones()
      } else onClose()
    } catch {
      setErrorEntrega('No se pudo guardar la dirección. Revisa tu conexión e inténtalo otra vez.')
    } finally {
      setGuardando(false)
    }
  }

  const seleccionarDireccion = async (direccion: DireccionGuardada) => {
    setAccionDireccion(direccion.id || null)
    try {
      const response = await fetch('/api/direcciones/predeterminada', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direccion_id: direccion.id }),
      })
      const result = await response.json()
      if (!response.ok || !result.ok) throw new Error(result.error || 'No se pudo seleccionar la dirección.')
      const seleccionada = { ...direccion, es_predeterminada: true }
      setDirecciones((actuales) => actuales.map((item) => ({ ...item, es_predeterminada: item.id === direccion.id })))
      setDireccionEnEdicion(seleccionada)
      setDireccionTexto(direccion.direccion)
      setReferencia(direccion.referencia || '')
      setEtiqueta(direccion.etiqueta)
      const coords = coordenadasValidas(direccion.lat, direccion.lng)
      if (coords) { ponerPin(coords[0], coords[1]); mapa.current?.flyTo(coords, 16, { duration: 0.45 }) }
      onDireccionSeleccionada?.()
    } catch (error) {
      setErrorEntrega(error instanceof Error ? error.message : 'No se pudo seleccionar la dirección.')
    } finally { setAccionDireccion(null) }
  }

  const editarDireccion = (direccion: DireccionGuardada) => {
    setDireccionEnEdicion(direccion)
    setDireccionTexto(direccion.direccion)
    setReferencia(direccion.referencia || '')
    setEtiqueta(direccion.etiqueta)
    setErrorEntrega(null)
    setCapturandoDireccion(true)
    setVista('direcciones')
    const coords = coordenadasValidas(direccion.lat, direccion.lng)
    if (coords) { ponerPin(coords[0], coords[1]); mapa.current?.flyTo(coords, 16, { duration: 0.45 }) }
  }

  const eliminarDireccion = async (direccion: DireccionGuardada) => {
    if (!direccion.id || !window.confirm(`¿Eliminar la dirección “${direccion.etiqueta}”?`)) return
    setAccionDireccion(direccion.id)
    try {
      const response = await fetch(`/api/direcciones/${direccion.id}`, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok || !result.ok) throw new Error(result.error || 'No se pudo eliminar la dirección.')
      if (direccionEnEdicion?.id === direccion.id) { setDireccionEnEdicion(null); setCapturandoDireccion(false) }
      await cargarDirecciones()
      onDireccionSeleccionada?.()
    } catch (error) {
      setErrorEntrega(error instanceof Error ? error.message : 'No se pudo eliminar la dirección.')
    } finally { setAccionDireccion(null) }
  }

  const formularioDireccion = (idPrefix: 'desktop' | 'mobile') => (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-black/65 p-3 backdrop-blur-xl">
      <div>
        <p className="motomoto-display text-sm font-black text-white">📍 {modoEdicion ? 'Actualiza tu ubicación' : 'Guarda tu ubicación'}</p>
        <p className="mt-1 text-[11px] text-white/55">El pin conserva tus coordenadas; la lista muestra distancias aproximadas y el pedido calcula la ruta de entrega.</p>
      </div>
      <div>
        <label htmlFor={`mapa-direccion-${idPrefix}`} className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-white/60">Dirección</label>
        <input id={`mapa-direccion-${idPrefix}`} value={direccionTexto} onChange={(e) => setDireccionTexto(e.target.value)} placeholder="Jr., avenida, número o zona" autoComplete="street-address" className="w-full rounded-xl border border-white/15 bg-black/55 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-orange-400" />
      </div>
      <div>
        <label htmlFor={`mapa-referencia-${idPrefix}`} className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-white/60">Referencia (opcional)</label>
        <input id={`mapa-referencia-${idPrefix}`} value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Portón, piso, frente a…" autoComplete="off" className="w-full rounded-xl border border-white/15 bg-black/55 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-orange-400" />
      </div>
      <fieldset>
        <legend className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-white/60">Guardar como</legend>
        <div className="flex gap-2">
          {['Casa', 'Trabajo', 'Otro'].map((nombre) => <button key={nombre} type="button" onClick={() => setEtiqueta(nombre)} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${etiqueta === nombre ? 'border-orange-400 bg-orange-500/20 text-white' : 'border-white/15 bg-white/5 text-white/65 hover:bg-white/10'}`}>{nombre === 'Casa' ? '🏠 ' : nombre === 'Trabajo' ? '💼 ' : '📌 '}{nombre}</button>)}
        </div>
      </fieldset>
      {errorEntrega && <p role="alert" className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">{errorEntrega}</p>}
    </div>
  )
  const tarjetas = (mobile = false) => visibles.map((local) => (
    <div key={`${mobile ? 'm' : 'd'}-${local.id}`}>
      <TarjetaLocal local={local} activo={local.id === localActivo} distancia={distanciaDe(local)} onElegir={() => elegirLocal(local)} onClose={onClose} />
    </div>
  ))

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/65 p-0 backdrop-blur-md md:p-5" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-label="Locales en el mapa" className="flex h-[100dvh] w-full flex-col overflow-hidden border border-white/15 bg-[#08090b]/90 shadow-2xl backdrop-blur-2xl md:h-[min(94dvh,900px)] md:max-w-6xl md:rounded-[28px]">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 pb-2 pt-[max(14px,env(safe-area-inset-top))] md:grid-cols-[minmax(0,1fr)_auto_auto] md:px-6 md:pt-5">
          <div className="min-w-0"><h2 className="motomoto-display text-lg font-black uppercase tracking-wide text-white md:text-xl">Locales en el mapa</h2><p className="text-[11px] text-white/60 md:text-xs">{vista === 'direcciones' && !capturandoDireccion ? 'Elige una dirección guardada o administra tus ubicaciones' : 'Toca el mapa para marcar dónde entregamos'}</p></div>
          {mostrarDirecciones && <nav aria-label="Sección del mapa" className="col-span-2 row-start-2 flex gap-2 overflow-x-auto [scrollbar-width:none] md:col-span-1 md:col-start-2 md:row-start-1 md:mr-2 md:justify-self-center">
            <button type="button" onClick={() => { setVista('locales'); setCapturandoDireccion(false); setDireccionEnEdicion(null) }} className={`motomoto-display shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${vista === 'locales' ? 'bg-brand text-white shadow-lg shadow-brand/30' : 'bg-white/10 text-white/75 hover:bg-white/20'}`}>🗺️ Locales</button>
            <button type="button" onClick={() => { setVista('direcciones'); setCapturandoDireccion(false); setDireccionEnEdicion(null); void cargarDirecciones() }} className={`motomoto-display shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${vista === 'direcciones' ? 'bg-[#ff7628] text-white shadow-lg shadow-orange-500/25' : 'bg-white/10 text-white/75 hover:bg-white/20'}`}>🏠 Mis direcciones{direcciones.length ? ` · ${direcciones.length}` : ''}</button>
          </nav>}
          <button type="button" onClick={onClose} aria-label="Cerrar mapa" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-lg text-white transition hover:rotate-90 hover:bg-white/20">✕</button>
        </header>

        {vista === 'locales' && <nav aria-label="Filtrar por categoría" className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] md:px-6">
          <button type="button" onClick={() => setCategoriaActiva(null)} className={`motomoto-display shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${!categoriaActiva ? 'bg-brand text-white shadow-lg shadow-brand/30' : 'bg-white/10 text-white hover:bg-white/20'}`}>📍 Todos</button>
          {categorias.map((c) => <button key={c.slug} type="button" onClick={() => setCategoriaActiva(c.slug)} className={`motomoto-display shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${categoriaActiva === c.slug ? 'bg-brand text-white shadow-lg shadow-brand/30' : 'bg-white/10 text-white hover:bg-white/20'}`}>{c.emoji || '🍽️'} {c.nombre}</button>)}
        </nav>}

        <div className={`grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[330px_minmax(0,1fr)] ${capturandoDireccion ? 'grid-rows-[minmax(180px,1fr)_auto] md:grid-rows-1' : ''}`}>
          <aside className="hidden min-h-0 flex-col gap-2 overflow-y-auto overscroll-contain px-3 pb-3 pt-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,.25)_transparent] md:flex">
            {capturandoDireccion ? formularioDireccion('desktop') : vista === 'direcciones' ? <>
              {errorEntrega && <p role="alert" className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">{errorEntrega}</p>}
              <button type="button" onClick={() => { setDireccionEnEdicion(null); setDireccionTexto(''); setReferencia(''); setEtiqueta('Casa'); setErrorEntrega(null); setCapturandoDireccion(true) }} className="motomoto-display rounded-2xl border border-orange-300/60 bg-[#ff7628] px-4 py-3 text-left text-sm font-black text-[#17100b] shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-[#ff914f]">＋ Agregar una dirección nueva</button>
              {cargandoDirecciones && <p className="p-4 text-sm text-white/60">Cargando tus direcciones…</p>}
              {!cargandoDirecciones && direcciones.length === 0 && <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">Aún no guardaste direcciones. Agrega una para tenerla disponible en tus pedidos.</p>}
              {direcciones.map((d) => <article key={d.id} className={`rounded-2xl border p-3 ${d.es_predeterminada ? 'border-orange-400/60 bg-orange-500/10' : 'border-white/15 bg-black/50'}`}>
                <button type="button" onClick={() => void seleccionarDireccion(d)} disabled={!!accionDireccion} className="w-full text-left disabled:opacity-60"><span className="flex items-center justify-between gap-2"><strong className="truncate text-sm text-white">{d.etiqueta}</strong>{d.es_predeterminada && <span className="shrink-0 rounded-full bg-orange-400/20 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-orange-200">Seleccionada</span>}</span><span className="mt-1 block text-xs text-white/65">{d.direccion}</span>{d.referencia && <span className="mt-1 block text-[11px] text-white/45">Ref.: {d.referencia}</span>}</button>
                <div className="mt-3 flex gap-2"><button type="button" onClick={() => void seleccionarDireccion(d)} disabled={!!accionDireccion} className="flex-1 rounded-full bg-brand px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-light disabled:opacity-50">Usar esta</button><button type="button" onClick={() => editarDireccion(d)} className="rounded-full border border-white/20 px-3 py-2 text-xs font-bold text-white/80 transition hover:bg-white/10">Editar</button><button type="button" onClick={() => void eliminarDireccion(d)} disabled={!!accionDireccion} className="rounded-full border border-red-300/30 px-3 py-2 text-xs font-bold text-red-200 transition hover:bg-red-500/15 disabled:opacity-50">Eliminar</button></div>
              </article>)}
            </> : <>
              {cargando && <p className="p-6 text-center text-sm text-white/60">Cargando locales…</p>}
              {errorLocales && <p className="p-5 text-sm text-red-300">No se pudieron cargar los locales. Puedes marcar tu ubicación en el mapa.</p>}
              {!cargando && !errorLocales && visibles.length === 0 && <p className="p-5 text-sm text-white/60">No hay locales con ubicación registrada en esta categoría.</p>}
              {tarjetas()}
            </>}
          </aside>
          <div className={`relative order-first min-h-[45dvh] min-w-0 bg-[#151719] md:order-none md:min-h-0 ${capturandoDireccion ? 'min-h-0' : ''}`}>
            <div ref={contenedorMapa} className="absolute inset-0 z-0" />
            {errorMapa && <div className="absolute inset-0 z-10 grid place-items-center bg-[#111]/90 p-6 text-center text-sm text-white/70">No se pudo cargar el mapa. Puedes marcar la ubicación desde el GPS y escribir tu dirección.</div>}
            {puedeCambiarPin && <button type="button" onClick={usarUbicacion} disabled={ubicando} className="absolute right-3 top-3 z-[500] rounded-full border border-white/25 bg-black/75 px-4 py-2.5 text-xs font-bold text-white shadow-lg backdrop-blur-xl transition hover:bg-black disabled:opacity-60">{ubicando ? 'Buscando…' : '📍 Mi ubicación'}</button>}
            {!capturandoDireccion && <div className="absolute bottom-3 left-3 right-3 z-[500] flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] md:hidden">
              {tarjetas(true)}
              {!cargando && visibles.length === 0 && <div className="w-full rounded-2xl border border-white/15 bg-black/75 p-4 text-sm text-white/70 backdrop-blur-xl">{errorLocales ? 'No se pudieron cargar los locales.' : 'No hay locales con ubicación registrada en esta categoría.'}</div>}
            </div>}
          </div>
          {!capturandoDireccion && vista === 'direcciones' && <aside className="max-h-[34dvh] space-y-2 overflow-y-auto px-3 pb-2 md:hidden">
            {errorEntrega && <p role="alert" className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">{errorEntrega}</p>}
            <button type="button" onClick={() => { setDireccionEnEdicion(null); setDireccionTexto(''); setReferencia(''); setEtiqueta('Casa'); setErrorEntrega(null); setCapturandoDireccion(true) }} className="motomoto-display w-full rounded-2xl border border-orange-300/60 bg-[#ff7628] px-4 py-3 text-left text-sm font-black text-[#17100b] shadow-lg">＋ Agregar una dirección nueva</button>
            {cargandoDirecciones && <p className="p-3 text-sm text-white/60">Cargando tus direcciones…</p>}
            {!cargandoDirecciones && direcciones.length === 0 && <p className="rounded-2xl border border-white/10 bg-black/75 p-4 text-sm text-white/65">Aún no guardaste direcciones.</p>}
            {direcciones.map((d) => <article key={`mobile-${d.id}`} className={`rounded-2xl border p-3 ${d.es_predeterminada ? 'border-orange-400/60 bg-orange-500/10' : 'border-white/15 bg-black/75'}`}><div className="flex items-center justify-between gap-2"><strong className="truncate text-sm text-white">{d.etiqueta}</strong>{d.es_predeterminada && <span className="text-[9px] font-black uppercase text-orange-200">Seleccionada</span>}</div><p className="mt-1 text-xs text-white/65">{d.direccion}</p>{d.referencia && <p className="mt-1 text-[11px] text-white/45">Ref.: {d.referencia}</p>}<div className="mt-3 flex gap-2"><button type="button" onClick={() => void seleccionarDireccion(d)} className="flex-1 rounded-full bg-brand px-2 py-2 text-[11px] font-bold text-white">Usar</button><button type="button" onClick={() => editarDireccion(d)} className="rounded-full border border-white/20 px-3 py-2 text-[11px] font-bold text-white/80">Editar</button><button type="button" onClick={() => void eliminarDireccion(d)} className="rounded-full border border-red-300/30 px-3 py-2 text-[11px] font-bold text-red-200">Eliminar</button></div></article>)}
          </aside>}
          {capturandoDireccion && <aside className="max-h-[34dvh] overflow-y-auto px-3 pb-2 md:hidden">{formularioDireccion('mobile')}</aside>}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-white/10 bg-black/35 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] md:px-6">
          <div className="min-w-0"><p className="motomoto-display truncate text-xs font-bold text-white md:text-sm">🗺️ {punto ? `${punto[0].toFixed(5)}, ${punto[1].toFixed(5)}` : 'Aún no marcas tu ubicación'}</p><p className="mt-0.5 hidden text-[10px] text-white/50 sm:block">{capturandoDireccion ? 'Revisa el punto del mapa y completa tu dirección.' : vista === 'direcciones' ? 'La dirección guardada es de solo lectura. Pulsa Editar para mover el pin.' : 'Marca o arrastra el pin; verás la distancia aproximada a cada local.'}</p></div>
          <div className="flex shrink-0 items-center gap-2">
            {capturandoDireccion && <button type="button" onClick={() => { setCapturandoDireccion(false); setErrorEntrega(null) }} className="rounded-full border border-white/20 px-4 py-3 text-xs font-bold text-white/75 transition hover:bg-white/10">Atrás</button>}
            {!capturandoDireccion && mostrarDirecciones && vista === 'direcciones' ? null : <button type="button" disabled={guardando || (!capturandoDireccion && !punto)} onClick={() => capturandoDireccion ? void guardarDireccion() : (setDireccionEnEdicion(null), setDireccionTexto(direccionActual?.direccion || ''), setReferencia(direccionActual?.referencia || ''), setEtiqueta(direccionActual?.etiqueta || 'Casa'), setErrorEntrega(null), setCapturandoDireccion(true))} className="motomoto-display shrink-0 rounded-full border border-orange-200/70 bg-[#ff7628] px-4 py-3 text-xs font-black text-[#17100b] shadow-[0_8px_24px_rgba(255,118,40,.28)] transition hover:-translate-y-0.5 hover:bg-[#ff914f] disabled:cursor-not-allowed disabled:opacity-50 md:px-6">{guardando ? 'Guardando…' : capturandoDireccion ? (direccionEnEdicion || modoEdicion ? 'Guardar cambios' : 'Guardar dirección') : (modoEdicion ? 'Editar dirección' : '＋ Añadir ubicación')}</button>}
          </div>
        </footer>
      </section>
    </div>
  )
}
