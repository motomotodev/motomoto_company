'use client'

import Link from 'next/link'
import { CalificacionEstrellas, FavoritoButton, usePreferenciasCliente } from '@/components/ui/preferencias-cliente'

interface Props {
  id: string
  nombre: string
  subtitulo: string | null
  banner_url: string | null
  logo_url: string | null
  tiempo_estimado: string | null
  monto_minimo: string
  abierto: boolean
  horarioHoy: string | null
  direccion: string | null
}

export default function HeaderRestaurante({
  id,
  nombre,
  subtitulo,
  banner_url,
  logo_url,
  tiempo_estimado,
  monto_minimo,
  abierto,
  horarioHoy,
  direccion,
}: Props) {
  const { favoritos, calificaciones, pendientes, toggleFavorito, calificar, clave } = usePreferenciasCliente()
  const key = clave('restaurante', id)
  return (
    <div className="relative">
      {/* BANNER */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        {banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner_url}
            alt={nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand/30 to-brand/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-black/30 to-black/40" />

        {/* Botón atrás */}
        <Link
          href="/"
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          aria-label="Volver"
        >
          ←
        </Link>
      </div>

      {/* CARD INFO (flotante) */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-surface border border-line rounded-3xl p-5 md:p-6 shadow-2xl">
          <div className="flex items-start gap-4 mb-4">
            {/* LOGO */}
            <div className="flex-shrink-0">
              {logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo_url}
                  alt={nombre}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-line-light"
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-brand/20 border-2 border-line-light flex items-center justify-center text-3xl">
                  🏪
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-xl font-black leading-tight text-white md:text-3xl">{nombre}</h1>
                <FavoritoButton active={favoritos.has(key)} pending={pendientes.has(key)} onClick={(source) => void toggleFavorito('restaurante', id, source).catch((error) => window.alert(error instanceof Error ? error.message : 'No se pudo actualizar el favorito.'))} />
              </div>
              {subtitulo && (
                <p className="text-sm text-gray-400 mt-0.5">{subtitulo}</p>
              )}

              {/* Estado abierto/cerrado */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {abierto ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-brand bg-brand/10 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                    Abierto ahora
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-800 px-2.5 py-1 rounded-full">
                    🔒 Cerrado
                  </span>
                )}
                {horarioHoy && (
                  <span className="text-xs text-gray-500">
                    {horarioHoy}
                  </span>
                )}
              </div>
              <div className="mt-3"><CalificacionEstrellas rating={calificaciones[key]} pending={pendientes.has(key)} onRate={(estrellas) => void calificar('restaurante', id, estrellas).catch((error) => window.alert(error instanceof Error ? error.message : 'No se pudo guardar tu calificación.'))} /></div>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-line">
            <div className="text-center border-r border-line">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Tiempo
              </p>
              <p className="text-sm font-bold text-white">
                ⏱ {tiempo_estimado || '—'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Mínimo
              </p>
              <p className="text-sm font-bold text-brand">
                S/ {Number(monto_minimo).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Dirección */}
          {direccion && (
            <div className="mt-4 pt-4 border-t border-line flex items-start gap-2 text-xs text-gray-500">
              <span>📍</span>
              <span className="flex-1">{direccion}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
