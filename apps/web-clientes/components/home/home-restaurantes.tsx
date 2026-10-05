'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useEnviosMultiples } from '@/hooks/use-envio'
import { useDireccionActual, type DireccionLocal } from '@/hooks/use-direccion-actual'
import { ABRIR_DIRECCION_EVENT } from '@/lib/direccion-events'
import { FavoritoButton, usePreferenciasCliente } from '@/components/ui/preferencias-cliente'
import type { EnvioInfo } from '@/hooks/use-envio'
import PedidoModal from '@/components/carrito/pedido-modal'
import { ABRIR_PEDIDO_EVENT } from '@/lib/pedido-events'

export interface CategoriaRestaurante {
  slug: string
  nombre: string
  emoji: string | null
}

export interface PlatoHome {
  id: string
  restaurante_id: string
  nombre: string
  descripcion: string | null
  precio: string
  imagen_url: string | null
  tiempo_estimado: number | null
  disponible: boolean
  subcategoria_id: string | null
  subcategoria_nombre: string | null
  grupos: {
    id: string
    titulo: string
    requerido: boolean
    minimo: number
    maximo: number
    choices: { id: string; nombre: string; precio_extra: string }[]
  }[]
}

export interface RestauranteHome {
  id: string
  slug: string
  nombre: string
  subtitulo: string | null
  banner_url: string | null
  logo_url: string | null
  direccion_fisica: string | null
  tiempo_estimado: string | null
  monto_minimo: string | number
  calificacion: string | number
  num_resenas: number
  lat: string | number | null
  lng: string | number | null
  abierto: boolean
  categorias: CategoriaRestaurante[]
  platos: PlatoHome[]
}

interface Props {
  restaurantes: RestauranteHome[]
  direccionDeBD: DireccionLocal | null
  estaLogueado: boolean
  costoVip: number
}

type Orden = 'calificados' | 'rapidos' | 'envio' | 'cercanos'
type RestauranteCardStyle = CSSProperties & {
  '--restaurant-index': number
}

function iconoCategoria(categoria?: CategoriaRestaurante | null) {
  if (!categoria) return '🍽️'
  if (categoria.emoji) return categoria.emoji
  if (/pizza/.test(categoria.slug)) return '🍕'
  if (/chifa|chaufa/.test(categoria.slug)) return '🍜'
  return '🍽️'
}

function valorNumerico(valor: unknown): number | null {
  if (valor == null || (typeof valor === 'string' && !valor.trim())) return null
  const n = Number(valor)
  return Number.isFinite(n) ? n : null
}

function minutos(tiempo: string | null) {
  const n = tiempo?.match(/\d+/)?.[0]
  return n ? Number(n) : Number.POSITIVE_INFINITY
}

export default function HomeRestaurantes({ restaurantes, direccionDeBD, estaLogueado, costoVip }: Props) {
  const direccion = useDireccionActual(direccionDeBD)
  const lat = valorNumerico(direccion?.lat)
  const lng = valorNumerico(direccion?.lng)
  const [categoria, setCategoria] = useState<string | null>(null)
  const [orden, setOrden] = useState<Orden>('calificados')
  const [pedidoAbierto, setPedidoAbierto] = useState(false)
  const [bannerIndex, setBannerIndex] = useState(0)
  const preferencias = usePreferenciasCliente()
  const { favoritos, pendientes, toggleFavorito, clave } = preferencias
  const banners = useMemo(() => restaurantes.filter((restaurante) => restaurante.banner_url || restaurante.logo_url).slice(0, 5), [restaurantes])
  const bannerActivo = banners[bannerIndex % Math.max(banners.length, 1)]

  const ids = useMemo(() => restaurantes.map((r) => r.id), [restaurantes])
  const { envios, loading } = useEnviosMultiples(ids, lat, lng)

  useEffect(() => {
    if (banners.length < 2) return
    const timer = window.setInterval(() => setBannerIndex((index) => (index + 1) % banners.length), 5200)
    return () => window.clearInterval(timer)
  }, [banners.length])

  useEffect(() => {
    const abrirPedido = () => setPedidoAbierto(true)
    window.addEventListener(ABRIR_PEDIDO_EVENT, abrirPedido)
    return () => window.removeEventListener(ABRIR_PEDIDO_EVENT, abrirPedido)
  }, [])

  const categorias = useMemo(() => {
    const porSlug = new Map<string, CategoriaRestaurante>()
    restaurantes.forEach((r) => r.categorias.forEach((c) => {
      if (c.slug && !porSlug.has(c.slug)) porSlug.set(c.slug, c)
    }))
    return [...porSlug.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [restaurantes])

  const filtrados = useMemo(() => {
    const rows = restaurantes.filter((r) => !categoria || r.categorias.some((c) => c.slug === categoria))
    return [...rows].sort((a, b) => {
      if (orden === 'rapidos') return minutos(a.tiempo_estimado) - minutos(b.tiempo_estimado)
      if (orden === 'envio') return (envios[a.id]?.costo ?? Number.POSITIVE_INFINITY) - (envios[b.id]?.costo ?? Number.POSITIVE_INFINITY)
      if (orden === 'cercanos') return (envios[a.id]?.distancia_km ?? Number.POSITIVE_INFINITY) - (envios[b.id]?.distancia_km ?? Number.POSITIVE_INFINITY)
      return Number(b.calificacion || 0) - Number(a.calificacion || 0)
    })
  }, [categoria, envios, orden, restaurantes])

  const elegirOrden = (seleccion: Orden) => {
    setOrden(seleccion)
    if ((seleccion === 'envio' || seleccion === 'cercanos') && (lat == null || lng == null)) {
      window.dispatchEvent(new Event(ABRIR_DIRECCION_EVENT))
    }
  }

  const textoEnvio = (restaurante: RestauranteHome) => {
    if (lat == null || lng == null) return '📍 Agrega tu ubicación'
    if (loading && !envios[restaurante.id]) return '🛵 Calculando…'
    const envio = envios[restaurante.id]
    if (!envio) return '🛵 Sin cálculo'
    if (envio.permitido && envio.costo != null) return `🛵 S/ ${envio.costo.toFixed(2)}`
    if (envio.razon === 'SUPERA_DISTANCIA_MAXIMA') return '🛵 Fuera de cobertura'
    if (envio.razon === 'RUTA_NO_DISPONIBLE') return '🛵 Ruta no disponible'
    return '🛵 Sin cobertura'
  }

  return (
    <section id="todos" aria-label="Todos los restaurantes" className="mm-restaurants mx-auto w-full max-w-6xl px-4 pb-28 pt-7 md:pb-16">
      <PedidoModal open={pedidoAbierto} onClose={() => setPedidoAbierto(false)} estaLogueado={estaLogueado} direccionDeBD={direccionDeBD} restaurantes={restaurantes} costoVip={costoVip} />

      {bannerActivo && <div className="mm-mobile-feature-zone md:hidden">
        <section className="mm-mobile-hero" aria-label="Restaurantes destacados">
          <img key={bannerActivo.id} src={bannerActivo.banner_url || bannerActivo.logo_url || ''} alt="" className="mm-mobile-hero-image" />
          <div className="mm-mobile-hero-shade" />
          <div className="mm-mobile-hero-copy">
            <span>Descubre MotoMoto</span>
            <h2>{bannerActivo.nombre}</h2>
            <p>{bannerActivo.subtitulo || 'Tus sabores favoritos, recién preparados.'}</p>
            <a href={`/restaurante/${bannerActivo.slug}`}>Ver restaurante <span aria-hidden="true">→</span></a>
          </div>
          {banners.length > 1 && <div className="mm-mobile-hero-dots" aria-label="Elegir restaurante destacado">
            {banners.map((restaurante, index) => <button key={restaurante.id} type="button" aria-label={`Mostrar ${restaurante.nombre}`} aria-current={index === bannerIndex} onClick={() => setBannerIndex(index)} className={index === bannerIndex ? 'is-active' : ''} />)}
          </div>}
        </section>
      </div>}

      <nav id="restaurant-categories" aria-label="Categorías de restaurantes" className="mm-mobile-categories md:hidden">
        <button type="button" aria-pressed={!categoria} onClick={() => setCategoria(null)} className={!categoria ? 'is-active' : ''}><span className="mm-mobile-category-icon">🍽️</span><span>Todos</span></button>
        {categorias.map((c) => <button type="button" key={c.slug} aria-pressed={categoria === c.slug} onClick={() => setCategoria(c.slug)} className={categoria === c.slug ? 'is-active' : ''}><span className="mm-mobile-category-icon">{iconoCategoria(c)}</span><span>{c.nombre}</span></button>)}
      </nav>

      <div className="mm-mobile-restaurants-heading md:hidden">
        <h2>Restaurantes populares</h2>
        <span>{filtrados.length}</span>
      </div>

      <div className="mm-desktop-restaurants-heading mb-5 hidden flex-wrap items-end justify-between gap-3 md:flex">
        <div>
          <span className="motomoto-display inline-block rounded-full bg-brand/90 px-3 py-1 text-[10px] font-black uppercase tracking-[.18em] text-white shadow-lg shadow-brand/30">Explora</span>
          <h1 className="motomoto-display mt-2 text-3xl font-black uppercase leading-none text-[#111827] sm:text-4xl md:text-5xl">Todos los <span className="text-[#2447db]">restaurantes</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="motomoto-display rounded-full border border-black/10 bg-black/[.04] px-4 py-2 text-xs font-bold text-[#303849]">{filtrados.length} {filtrados.length === 1 ? 'restaurante' : 'restaurantes'}</span>
          <button type="button" onClick={() => setPedidoAbierto(true)} className="motomoto-display rounded-full bg-[#2447db] px-4 py-2.5 text-xs font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#1b39bd]">🛒 Mi pedido</button>
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <nav aria-label="Filtrar restaurantes por categoría" className="mm-filter-row hidden md:flex">
          <button type="button" aria-pressed={!categoria} onClick={() => setCategoria(null)} className={`mm-filter-chip ${!categoria ? 'is-active' : ''}`}>🍽️ Todos</button>
          {categorias.map((c) => <button type="button" key={c.slug} aria-pressed={categoria === c.slug} onClick={() => setCategoria(c.slug)} className={`mm-filter-chip ${categoria === c.slug ? 'is-active' : ''}`}><span aria-hidden="true">{iconoCategoria(c)}</span> {c.nombre}</button>)}
        </nav>
        <nav aria-label="Ordenar restaurantes" className="mm-filter-row hidden md:flex">
          {([
            ['calificados', '⭐ Mejor calificados'],
            ['rapidos', '⚡ Más rápidos'],
            ['envio', '🛵 Envío barato'],
            ['cercanos', '📍 Más cercanos'],
          ] as [Orden, string][]).map(([key, label]) => <button type="button" key={key} aria-pressed={orden === key} onClick={() => elegirOrden(key)} className={`mm-filter-chip mm-sort-chip ${orden === key ? 'is-active' : ''}`}>{label}</button>)}
        </nav>
      </div>

      {lat == null || lng == null ? (
        <button type="button" onClick={() => window.dispatchEvent(new Event(ABRIR_DIRECCION_EVENT))} className="mb-6 hidden w-full items-center gap-3 rounded-2xl border border-[#d9d4ca] bg-white p-4 text-left shadow-sm transition hover:border-[#c83a2d]/50 hover:shadow-md md:flex">
          <span className="text-2xl" aria-hidden="true">🗺️</span>
          <span><strong className="motomoto-display block text-sm font-black text-[#171717]">Agrega tu ubicación</strong><span className="mt-0.5 block text-xs text-[#646464]">Calcularemos el precio real del delivery de cada restaurante.</span></span>
        </button>
      ) : null}

      <div className="mm-restaurant-grid">
        {filtrados.map((r, index) => {
          const envio = envios[r.id]
          const primeraCategoria = r.categorias[0]
          const calificacion = Number(r.calificacion || 0)
          return (
            <article key={r.id} className="mm-restaurant-card" style={{ '--restaurant-index': index % 6 } as RestauranteCardStyle}>
              <a href={`/restaurante/${r.slug}`} className="mm-restaurant-media" aria-label={`Ver la carta de ${r.nombre}`}>
                {r.banner_url ? <img className="mm-restaurant-cover" src={r.banner_url} alt="" loading="lazy" decoding="async" /> : <span className="mm-restaurant-placeholder" aria-hidden="true">{iconoCategoria(primeraCategoria)}</span>}
                <span className="mm-restaurant-category"><span aria-hidden="true">{iconoCategoria(primeraCategoria)}</span>{primeraCategoria?.nombre || 'Restaurante'}</span>
                <span className={`mm-restaurant-availability ${r.abierto ? '' : 'is-closed'}`}>{r.abierto ? 'Abierto' : 'Cerrado'}</span>
                {r.logo_url && <span className="mm-restaurant-logo"><img src={r.logo_url} alt={`Logo de ${r.nombre}`} loading="lazy" /></span>}
              </a>
              <div className="mm-restaurant-favorite"><FavoritoButton compact active={favoritos.has(clave('restaurante', r.id))} pending={pendientes.has(clave('restaurante', r.id))} onClick={(source) => void toggleFavorito('restaurante', r.id, source).catch((error) => window.alert(error instanceof Error ? error.message : 'No se pudo actualizar el favorito.'))} /></div>
              <div className="mm-restaurant-content">
                <a href={`/restaurante/${r.slug}`} className="mm-restaurant-copy">
                  <strong>{r.nombre}</strong>
                  <span className="mm-restaurant-subtitle">{r.subtitulo || (r.direccion_fisica ? `📍 ${r.direccion_fisica}` : 'Descubre su carta')}</span>
                </a>
                <div className="mm-restaurant-meta">
                  {calificacion > 0 && <span className="mm-restaurant-rating">★ {calificacion.toFixed(1)}{r.num_resenas > 0 ? ` (${r.num_resenas})` : ''}</span>}
                  {r.tiempo_estimado && <span>◷ {r.tiempo_estimado}</span>}
                  {envio?.distancia_km != null && <span>{envio.distancia_km.toFixed(1)} km</span>}
                </div>
                <div className="mm-restaurant-footer">
                  <span className="mm-restaurant-delivery">{textoEnvio(r)}</span>
                </div>
              </div>
            </article>
          )
        })}
        {filtrados.length === 0 && <div className="mm-restaurant-empty">{restaurantes.length === 0 ? 'Aún no hay restaurantes activos en MotoMoto 🍽️' : 'No hay restaurantes en esta categoría 🍽️'}</div>}
      </div>
    </section>
  )
}
