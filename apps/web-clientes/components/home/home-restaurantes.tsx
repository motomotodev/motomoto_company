'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useEnviosMultiples } from '@/hooks/use-envio'
import { useDireccionActual, type DireccionLocal } from '@/hooks/use-direccion-actual'
import { ABRIR_DIRECCION_EVENT } from '@/lib/direccion-events'
import { FavoritoButton, usePreferenciasCliente } from '@/components/ui/preferencias-cliente'

export interface CategoriaRestaurante {
  slug: string
  nombre: string
  emoji: string | null
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
}

interface Props {
  restaurantes: RestauranteHome[]
  direccionDeBD: DireccionLocal | null
}

type Orden = 'calificados' | 'rapidos' | 'envio' | 'cercanos'
type RestauranteCardStyle = CSSProperties & {
  '--restaurant-paint': string
  '--restaurant-index': number
}

const PALETAS = [
  'linear-gradient(145deg,#e73982 0%,#8529b4 100%)',
  'linear-gradient(145deg,#f45136 0%,#7d4a2e 100%)',
  'linear-gradient(145deg,#41bce9 0%,#1765c9 100%)',
  'linear-gradient(145deg,#ff9a16 0%,#ed510c 100%)',
  'linear-gradient(145deg,#e94d66 0%,#7c258c 100%)',
  'linear-gradient(145deg,#62c4f5 0%,#3161d8 100%)',
]

function valorNumerico(valor: unknown): number | null {
  if (valor == null || (typeof valor === 'string' && !valor.trim())) return null
  const n = Number(valor)
  return Number.isFinite(n) ? n : null
}

function minutos(tiempo: string | null) {
  const n = tiempo?.match(/\d+/)?.[0]
  return n ? Number(n) : Number.POSITIVE_INFINITY
}

export default function HomeRestaurantes({ restaurantes, direccionDeBD }: Props) {
  const direccion = useDireccionActual(direccionDeBD)
  const lat = valorNumerico(direccion?.lat)
  const lng = valorNumerico(direccion?.lng)
  const [categoria, setCategoria] = useState<string | null>(null)
  const [orden, setOrden] = useState<Orden>('calificados')
  const { favoritos, pendientes, toggleFavorito, clave } = usePreferenciasCliente()

  const ids = useMemo(() => restaurantes.map((r) => r.id), [restaurantes])
  const { envios, loading } = useEnviosMultiples(ids, lat, lng)

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
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true" focusable="false">
        <filter id="mmRestaurantRough" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="3" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="motomoto-display inline-block rounded-full bg-brand/90 px-3 py-1 text-[10px] font-black uppercase tracking-[.18em] text-white shadow-lg shadow-brand/30">Explora</span>
          <h1 className="motomoto-display mt-2 text-3xl font-black uppercase leading-none text-white drop-shadow-lg sm:text-4xl md:text-5xl">Todos los <span className="text-brand-light">restaurantes</span></h1>
        </div>
        <span className="motomoto-display rounded-full border border-white/10 bg-black/55 px-4 py-2 text-xs font-bold text-white backdrop-blur">{filtrados.length} {filtrados.length === 1 ? 'restaurante' : 'restaurantes'}</span>
      </div>

      <div className="mb-4 space-y-2">
        <nav aria-label="Filtrar restaurantes por categoría" className="mm-filter-row">
          <button type="button" aria-pressed={!categoria} onClick={() => setCategoria(null)} className={`mm-filter-chip ${!categoria ? 'is-active' : ''}`}>🍽️ Todos</button>
          {categorias.map((c) => <button type="button" key={c.slug} aria-pressed={categoria === c.slug} onClick={() => setCategoria(c.slug)} className={`mm-filter-chip ${categoria === c.slug ? 'is-active' : ''}`}>{c.emoji || '🍽️'} {c.nombre}</button>)}
        </nav>
        <nav aria-label="Ordenar restaurantes" className="mm-filter-row">
          {([
            ['calificados', '⭐ Mejor calificados'],
            ['rapidos', '⚡ Más rápidos'],
            ['envio', '🛵 Envío barato'],
            ['cercanos', '📍 Más cercanos'],
          ] as [Orden, string][]).map(([key, label]) => <button type="button" key={key} aria-pressed={orden === key} onClick={() => elegirOrden(key)} className={`mm-filter-chip mm-sort-chip ${orden === key ? 'is-active' : ''}`}>{label}</button>)}
        </nav>
      </div>

      {lat == null || lng == null ? (
        <button type="button" onClick={() => window.dispatchEvent(new Event(ABRIR_DIRECCION_EVENT))} className="mb-6 flex w-full items-center gap-3 rounded-2xl border border-[#ff7628]/35 bg-black/55 p-4 text-left shadow-lg backdrop-blur-xl transition hover:border-[#ff7628]/70 hover:bg-black/70">
          <span className="text-2xl" aria-hidden="true">🗺️</span>
          <span><strong className="motomoto-display block text-sm font-black text-[#ffd45c]">Agrega tu ubicación</strong><span className="mt-0.5 block text-xs text-white/55">Calcularemos el precio real del delivery de cada restaurante.</span></span>
        </button>
      ) : null}

      <div className="mm-restaurant-grid">
        {filtrados.map((r, index) => {
          const envio = envios[r.id]
          const primeraCategoria = r.categorias[0]
          const paleta = PALETAS[index % PALETAS.length]
          const calificacion = Number(r.calificacion || 0)
          return (
            <article key={r.id} className="mm-restaurant-card" style={{ '--restaurant-paint': paleta, '--restaurant-index': index % 6 } as RestauranteCardStyle}>
              <span className="mm-restaurant-paint" aria-hidden="true" />
              <div className="absolute left-3 top-3 z-10"><FavoritoButton compact active={favoritos.has(clave('restaurante', r.id))} pending={pendientes.has(clave('restaurante', r.id))} onClick={(source) => void toggleFavorito('restaurante', r.id, source).catch((error) => window.alert(error instanceof Error ? error.message : 'No se pudo actualizar el favorito.'))} /></div>
              <span className={`mm-restaurant-availability ${r.abierto ? '' : 'is-closed'}`}>{r.abierto ? '● Abierto ahora' : 'Cerrado'}</span>
              <Link href={`/restaurante/${r.slug}`} className="mm-restaurant-cta">Ver carta <span aria-hidden="true">→</span></Link>
              <span className="mm-restaurant-copy">
                <strong>{r.nombre}</strong>
                <span className="mm-restaurant-subtitle">{primeraCategoria ? `${primeraCategoria.emoji || '🍽️'} ${primeraCategoria.nombre}` : 'Restaurante MotoMoto'}{r.direccion_fisica ? ` · ${r.direccion_fisica}` : ''}</span>
                <span className="mm-restaurant-meta">
                  {calificacion > 0 && <span>⭐ {calificacion.toFixed(1)}{r.num_resenas > 0 ? ` · ${r.num_resenas}` : ''}</span>}
                  {r.tiempo_estimado && <span>⏱ {r.tiempo_estimado}</span>}
                  <span>{textoEnvio(r)}</span>
                  <span>Desde S/ {Number(r.monto_minimo || 0).toFixed(2)}</span>
                  {envio?.distancia_km != null && <span className="mm-distance-pill">📍 {envio.distancia_km.toFixed(1)} km</span>}
                </span>
                {!r.abierto && <span className="mm-restaurant-closed-note">Puedes revisar la carta; los pedidos se habilitan al abrir.</span>}
              </span>
              <span className="mm-restaurant-logo" aria-hidden="true">
                {r.logo_url ? <img src={r.logo_url} alt="" loading="lazy" /> : <span>{primeraCategoria?.emoji || '🏪'}</span>}
              </span>
            </article>
          )
        })}
        {filtrados.length === 0 && <div className="mm-restaurant-empty">{restaurantes.length === 0 ? 'Aún no hay restaurantes activos en MotoMoto 🍽️' : 'No hay restaurantes en esta categoría 🍽️'}</div>}
      </div>
    </section>
  )
}
