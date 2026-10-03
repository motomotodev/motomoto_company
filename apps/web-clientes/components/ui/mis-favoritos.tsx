'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FavoritoButton } from './preferencias-cliente'

type RestauranteFavorito = { id: string; slug: string; nombre: string; logo_url: string | null; direccion_fisica: string | null; calificacion: string | number; num_resenas: number }
type PlatoFavorito = { id: string; nombre: string; descripcion: string | null; precio: string | number; imagen_url: string | null; disponible: boolean; restaurante_slug: string; restaurante_nombre: string }

export default function MisFavoritos({ restaurantes: inicialesR, platos: inicialesP }: { restaurantes: RestauranteFavorito[]; platos: PlatoFavorito[] }) {
  const [restaurantes, setRestaurantes] = useState(inicialesR)
  const [platos, setPlatos] = useState(inicialesP)
  const [seccion, setSeccion] = useState<'restaurantes' | 'platos'>('restaurantes')
  const [pendiente, setPendiente] = useState<string | null>(null)

  async function quitar(tipo: 'restaurante' | 'plato', id: string) {
    const key = `${tipo}:${id}`
    setPendiente(key)
    try {
      const response = await fetch('/api/favoritos', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, id }),
      })
      const result = await response.json()
      if (!response.ok || !result.ok) throw new Error(result.error || 'No se pudo quitar el favorito.')
      if (tipo === 'restaurante') setRestaurantes((current) => current.filter((item) => item.id !== id))
      else setPlatos((current) => current.filter((item) => item.id !== id))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo quitar el favorito.')
    } finally { setPendiente(null) }
  }

  return <>
    <nav aria-label="Mis favoritos" className="mb-5 flex gap-2">
      <button type="button" onClick={() => setSeccion('restaurantes')} className={`rounded-full px-4 py-2 text-sm font-bold ${seccion === 'restaurantes' ? 'bg-brand text-white' : 'bg-white/10 text-white/70'}`}>🏪 Restaurantes · {restaurantes.length}</button>
      <button type="button" onClick={() => setSeccion('platos')} className={`rounded-full px-4 py-2 text-sm font-bold ${seccion === 'platos' ? 'bg-brand text-white' : 'bg-white/10 text-white/70'}`}>🍽️ Comidas · {platos.length}</button>
    </nav>

    {seccion === 'restaurantes' ? restaurantes.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {restaurantes.map((r) => <article key={r.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/55 p-3 backdrop-blur">
        <Link href={`/restaurante/${r.slug}`} className="flex min-w-0 flex-1 items-center gap-3">
          {r.logo_url ? <img src={r.logo_url} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <span className="grid h-14 w-14 place-items-center rounded-xl bg-white/10 text-2xl">🏪</span>}
          <span className="min-w-0"><strong className="block truncate text-sm text-white">{r.nombre}</strong><span className="mt-1 block truncate text-xs text-white/50">{r.direccion_fisica || (Number(r.calificacion) ? `⭐ ${Number(r.calificacion).toFixed(1)} · ${r.num_resenas} reseñas` : 'Ver menú y detalles')}</span></span>
        </Link>
        <FavoritoButton compact active pending={pendiente === `restaurante:${r.id}`} onClick={() => void quitar('restaurante', r.id)} />
      </article>)}
    </div> : <Vacio texto="Todavía no guardaste restaurantes." /> : platos.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {platos.map((p) => <article key={p.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/55 p-3 backdrop-blur">
        <Link href={`/restaurante/${p.restaurante_slug}`} className="flex min-w-0 flex-1 items-center gap-3">
          {p.imagen_url ? <img src={p.imagen_url} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <span className="grid h-14 w-14 place-items-center rounded-xl bg-white/10 text-2xl">🍽️</span>}
          <span className="min-w-0"><strong className="block truncate text-sm text-white">{p.nombre}</strong><span className="mt-1 block truncate text-xs text-white/50">{p.restaurante_nombre} · S/ {Number(p.precio).toFixed(2)}</span>{!p.disponible && <span className="mt-1 block text-[10px] text-orange-200">No disponible ahora</span>}</span>
        </Link>
        <FavoritoButton compact active pending={pendiente === `plato:${p.id}`} onClick={() => void quitar('plato', p.id)} />
      </article>)}
    </div> : <Vacio texto="Todavía no guardaste comidas." />}
  </>
}

function Vacio({ texto }: { texto: string }) {
  return <div className="rounded-3xl border border-white/10 bg-black/45 px-5 py-14 text-center"><p className="text-4xl">♡</p><p className="mt-3 text-sm text-white/60">{texto}</p><Link href="/" className="mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white">Explorar MotoMoto</Link></div>
}
