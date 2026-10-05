'use client'

import { useCarrito } from '@/lib/carrito/store'
import { useToast } from '@/components/ui/toast'
import { CalificacionEstrellas, FavoritoButton, type CalificacionResumen } from '@/components/ui/preferencias-cliente'

export interface Plato {
  id: string
  nombre: string
  descripcion: string | null
  precio: string
  imagen_url: string | null
  tiempo_estimado: number | null
  disponible: boolean
  subcategoria_id: string | null
  tiene_opciones: boolean
}

interface Props {
  plato: Plato
  restaurante: {
    id: string
    slug: string
    nombre: string
  }
  onAbrirOpciones: (plato: Plato) => void
  esFavorito: boolean
  pendiente: boolean
  calificacion?: CalificacionResumen
  onAlternarFavorito: (source: HTMLElement) => void
  onCalificar: (estrellas: number) => void
}

export default function PlatoCard({ plato, restaurante, onAbrirOpciones, esFavorito, pendiente, calificacion, onAlternarFavorito, onCalificar }: Props) {
  const agregar = useCarrito((s) => s.agregar)
  const items = useCarrito((s) => s.items)
  const { toast } = useToast()
  
  // Contar cuántas unidades de este plato sin opciones hay en el carrito
  const enCarrito = items
    .filter((i) => i.plato_id === plato.id && i.opciones.length === 0)
    .reduce((sum, i) => sum + i.cantidad, 0)

  function handleAgregar(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!plato.disponible) return

    // Si tiene opciones obligatorias → abrir modal
    if (plato.tiene_opciones) {
      onAbrirOpciones(plato)
      return
    }

    // Si no tiene opciones → agregar directo
    agregar({
      plato_id: plato.id,
      plato_nombre: plato.nombre,
      plato_imagen: plato.imagen_url,
      restaurante_id: restaurante.id,
      restaurante_slug: restaurante.slug,
      restaurante_nombre: restaurante.nombre,
      precio_unitario: Number(plato.precio),
      cantidad: 1,
      notas: null,
      opciones: [],
    })

    toast(`${plato.nombre} agregado`, { icon: '🛒' })
  }

  return (
    <article className={`mm-dish-card overflow-hidden rounded-[22px] border bg-surface shadow-lg transition duration-200 ${plato.disponible ? 'hover:-translate-y-1 hover:border-blue-300/70' : 'opacity-65'}`}>
        <div className="mm-dish-photo relative aspect-[1.75/1] overflow-hidden bg-[#082b62]">
          {plato.imagen_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={plato.imagen_url}
              alt={plato.nombre}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-blue-500/25 to-[#082b62] text-5xl">
              🍽️
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#061d45]/95 to-transparent" />
          {plato.tiempo_estimado && <span className="absolute bottom-2 left-2 rounded-full border border-white/25 bg-[#061d45]/75 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">◷ {plato.tiempo_estimado} min</span>}
          <div className="absolute right-2 top-2"><FavoritoButton compact active={esFavorito} pending={pendiente} onClick={onAlternarFavorito} /></div>
          {!plato.disponible && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="rounded-full border border-white/25 bg-[#061d45]/90 px-3 py-1.5 text-xs font-bold text-white">
                No disponible
              </span>
            </div>
          )}
        </div>

        <div className="flex min-h-[178px] flex-col p-3.5 text-white">
          <h3 className="line-clamp-2 text-base font-black leading-tight">{plato.nombre}</h3>
          {plato.descripcion && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-blue-100/65">
              {plato.descripcion}
            </p>
          )}
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <div className="min-w-0">
              <span className="block text-[10px] font-semibold text-blue-100/55">Precio</span>
              <span className="text-lg font-black text-white">S/ {Number(plato.precio).toFixed(2)}</span>
            </div>
            <div className="flex max-w-[55%] flex-col items-end gap-1">
              <CalificacionEstrellas compact rating={calificacion} pending={pendiente} onRate={onCalificar} />
              {plato.tiene_opciones && <span className="truncate text-[9px] font-semibold text-blue-100/65">Personalizable</span>}
            </div>
          </div>

          <div className="mt-2.5">
            {plato.disponible ? (
              <button
                type="button"
                onClick={handleAgregar}
                className="relative flex min-h-10 w-full items-center justify-between rounded-full bg-[#1877f2] px-4 text-sm font-black text-white shadow-md shadow-blue-950/30 transition hover:-translate-y-0.5 hover:bg-[#0b65dc] active:scale-[.98]"
                aria-label={`Agregar ${plato.nombre}`}
              >
                <span>{plato.tiene_opciones ? 'Elegir opciones' : 'Agregar al pedido'}</span>
                <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-white text-lg text-[#0b3473]">+</span>
                {enCarrito > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-[#1555a2] bg-white px-1 text-[10px] font-bold text-[#0b3473]">
                    {enCarrito}
                  </span>
                )}
              </button>
            ) : <div className="grid min-h-10 place-items-center rounded-full bg-white/10 text-xs font-bold text-white/60">Agotado</div>}
          </div>
        </div>
    </article>
  )
}
