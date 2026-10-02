'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type TipoVideo = 'WEB' | 'MOVIL'

interface VideoFondo {
  id: string
  tipo: TipoVideo
  nombre: string
  url: string
  creado_en: string
  actualizado_en: string
}

interface FormState {
  nombre: string
  url: string
}

const TIPOS: { id: TipoVideo; titulo: string; detalle: string }[] = [
  { id: 'WEB', titulo: 'Escritorio', detalle: 'Pantallas de 768 px o más' },
  { id: 'MOVIL', titulo: 'Móvil', detalle: 'Pantallas menores de 768 px' },
]

export default function VideosEditor({
  initialVideos,
  initialSeleccion,
}: {
  initialVideos: VideoFondo[]
  initialSeleccion: Record<TipoVideo, string | null>
}) {
  const router = useRouter()
  const [videos, setVideos] = useState(initialVideos)
  const [seleccion, setSeleccion] = useState(initialSeleccion)
  const [tipo, setTipo] = useState<TipoVideo>('WEB')
  const [form, setForm] = useState<FormState>({ nombre: '', url: '' })
  const [editando, setEditando] = useState<string | null>(null)
  const [formVisible, setFormVisible] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const videosTipo = useMemo(
    () => videos.filter((video) => video.tipo === tipo),
    [tipo, videos]
  )

  function empezarNuevo() {
    setEditando(null)
    setForm({ nombre: '', url: '' })
    setError(null)
    setAviso(null)
    setFormVisible(true)
  }

  function empezarEdicion(video: VideoFondo) {
    setTipo(video.tipo)
    setEditando(video.id)
    setForm({ nombre: video.nombre, url: video.url })
    setError(null)
    setAviso(null)
    setFormVisible(true)
  }

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setAviso(null)
    setGuardando(true)

    try {
      const editing = !!editando
      const res = await fetch(
        editing ? `/api/videos-fondo/${editando}` : '/api/videos-fondo',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing ? form : { ...form, tipo }),
        }
      )
      const result = await res.json()
      if (!res.ok || !result.ok) {
        setError(result.error || 'No se pudo guardar el video.')
        return
      }

      const saved = result.data as VideoFondo
      setVideos((current) =>
        editing
          ? current.map((video) => (video.id === saved.id ? saved : video))
          : [saved, ...current.filter((video) => video.id !== saved.id)]
      )
      setFormVisible(false)
      setEditando(null)
      setForm({ nombre: '', url: '' })
      setAviso(editing ? 'Video actualizado.' : 'URL añadida al catálogo.')
      router.refresh()

      if (!editing && !seleccion[tipo]) {
        await elegir(saved.id, tipo)
      }
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setGuardando(false)
    }
  }

  async function elegir(videoId: string, tipoDestino: TipoVideo) {
    setError(null)
    setAviso(null)
    setGuardando(true)
    try {
      const res = await fetch('/api/videos-fondo/seleccion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: tipoDestino, videoId }),
      })
      const result = await res.json()
      if (!res.ok || !result.ok) {
        setError(result.error || 'No se pudo cambiar el fondo.')
        return
      }
      setSeleccion((current) => ({ ...current, [tipoDestino]: videoId }))
      setAviso(`Fondo de ${tipoDestino === 'WEB' ? 'escritorio' : 'móvil'} actualizado.`)
      router.refresh()
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(video: VideoFondo) {
    if (!window.confirm(`¿Eliminar “${video.nombre}” del catálogo?`)) return
    setError(null)
    setAviso(null)
    setGuardando(true)
    try {
      const res = await fetch(`/api/videos-fondo/${video.id}`, { method: 'DELETE' })
      const result = await res.json()
      if (!res.ok || !result.ok) {
        setError(result.error || 'No se pudo eliminar el video.')
        return
      }
      setVideos((current) => current.filter((item) => item.id !== video.id))
      setSeleccion((current) =>
        current[video.tipo] === video.id
          ? { ...current, [video.tipo]: null }
          : current
      )
      setAviso('Video eliminado.')
      router.refresh()
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setGuardando(false)
    }
  }

  function cambiarTipo(nuevoTipo: TipoVideo) {
    setTipo(nuevoTipo)
    setError(null)
    setAviso(null)
    setFormVisible(false)
    setEditando(null)
    setForm({ nombre: '', url: '' })
  }

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      {aviso && (
        <div role="status" className="rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand-light">
          {aviso}
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        {TIPOS.map((item) => {
          const selected = videos.find((video) => video.id === seleccion[item.id])
          return (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-line bg-surface p-4 md:p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-white">Fondo para {item.titulo.toLowerCase()}</h2>
                  <p className="mt-1 text-xs text-gray-500">{item.detalle}</p>
                </div>
                <span className="rounded-full bg-brand/15 px-2.5 py-1 text-[10px] font-bold text-brand-light">{item.id}</span>
              </div>

              <label className="mb-3 block text-xs font-semibold text-gray-400" htmlFor={`video-seleccion-${item.id}`}>
                Video activo
              </label>
              <select
                id={`video-seleccion-${item.id}`}
                value={seleccion[item.id] ?? ''}
                onChange={(e) => e.target.value && elegir(e.target.value, item.id)}
                disabled={guardando || videos.filter((video) => video.tipo === item.id).length === 0}
                className="w-full rounded-xl border border-line-light bg-surface-dark px-3 py-3 text-sm text-white outline-none focus:border-brand disabled:opacity-50"
              >
                <option value="">Sin video seleccionado</option>
                {videos.filter((video) => video.tipo === item.id).map((video) => (
                  <option key={video.id} value={video.id}>{video.nombre}</option>
                ))}
              </select>

              <div className="mt-4 aspect-video overflow-hidden rounded-xl border border-line bg-black">
                {selected ? (
                  <video
                    key={`${item.id}-${selected.id}-${selected.url}`}
                    src={selected.url}
                    className="h-full w-full object-cover"
                    controls
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-5 text-center text-sm text-gray-500">
                    Añade una URL para previsualizar y elegir el fondo.
                  </div>
                )}
              </div>
              {selected && <p className="mt-2 truncate text-xs text-gray-500" title={selected.url}>{selected.url}</p>}
            </div>
          )
        })}
      </section>

      <section className="rounded-2xl border border-line bg-surface p-4 md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-white">Catálogo de videos</h2>
            <p className="mt-1 text-xs text-gray-500">Guarda varias URLs y cambia cuál se muestra con el selector de arriba.</p>
          </div>
          <button
            type="button"
            onClick={empezarNuevo}
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
          >
            + Añadir URL
          </button>
        </div>

        <div className="mb-4 flex gap-2 border-b border-line">
          {TIPOS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => cambiarTipo(item.id)}
              className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${tipo === item.id ? 'border-brand text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              {item.titulo} ({videos.filter((video) => video.tipo === item.id).length})
            </button>
          ))}
        </div>

        {formVisible && (
          <form onSubmit={guardar} className="mb-5 grid gap-3 rounded-xl border border-line-light bg-surface-dark p-4 md:grid-cols-2">
            <div>
              <label htmlFor="video-nombre" className="mb-1.5 block text-xs font-semibold text-gray-400">Nombre interno</label>
              <input
                id="video-nombre"
                required
                minLength={2}
                maxLength={120}
                value={form.nombre}
                onChange={(e) => setForm((current) => ({ ...current, nombre: e.target.value }))}
                placeholder="Ej. Fondo azul escritorio"
                className="w-full rounded-xl border border-line-light bg-surface px-3 py-3 text-sm text-white outline-none focus:border-brand"
              />
            </div>
            <div>
              <label htmlFor="video-url" className="mb-1.5 block text-xs font-semibold text-gray-400">URL pública del archivo</label>
              <input
                id="video-url"
                required
                type="url"
                value={form.url}
                onChange={(e) => setForm((current) => ({ ...current, url: e.target.value }))}
                placeholder="https://.../video.mp4"
                className="w-full rounded-xl border border-line-light bg-surface px-3 py-3 text-sm text-white outline-none focus:border-brand"
              />
              <p className="mt-1.5 text-[11px] text-gray-500">Usa el enlace directo HTTPS al archivo MP4 o WebM, no la página del video.</p>
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <span className="rounded-full bg-surface px-3 py-1.5 text-xs text-gray-400">Destino: {tipo === 'WEB' ? 'Escritorio' : 'Móvil'}</span>
              <button type="submit" disabled={guardando} className="ml-auto rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Añadir al catálogo'}
              </button>
              <button type="button" onClick={() => setFormVisible(false)} className="rounded-lg border border-line-light px-4 py-2 text-sm text-gray-300 hover:bg-surface-light">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {videosTipo.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-light px-5 py-10 text-center text-sm text-gray-500">
            No hay URLs para {tipo === 'WEB' ? 'escritorio' : 'móvil'} todavía.
          </div>
        ) : (
          <div className="space-y-2">
            {videosTipo.map((video) => {
              const activo = seleccion[tipo] === video.id
              return (
                <article key={video.id} className="flex flex-col gap-3 rounded-xl border border-line bg-surface-dark p-3 md:flex-row md:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-white">{video.nombre}</h3>
                      {activo && <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-400">En uso</span>}
                    </div>
                    <p className="mt-1 truncate text-xs text-gray-500" title={video.url}>{video.url}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <button type="button" onClick={() => empezarEdicion(video)} className="text-xs font-semibold text-gray-400 hover:text-white">Editar</button>
                    <button type="button" onClick={() => eliminar(video)} disabled={guardando} className="text-xs font-semibold text-danger hover:text-red-300 disabled:opacity-50">Eliminar</button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}