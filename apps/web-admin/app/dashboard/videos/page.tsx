import { sql } from '@/lib/db'
import VideosEditor from './_components/videos-editor'

export default async function VideosPage() {
  const [videos, seleccion] = await Promise.all([
    sql`
      SELECT id, tipo, nombre, url, creado_en, actualizado_en
      FROM videos_fondo
      ORDER BY tipo, creado_en DESC
    `,
    sql`
      SELECT tipo, video_id
      FROM videos_fondo_config
    `,
  ]) as [
    { id: string; tipo: 'WEB' | 'MOVIL'; nombre: string; url: string; creado_en: string; actualizado_en: string }[],
    { tipo: 'WEB' | 'MOVIL'; video_id: string | null }[],
  ]

  return (
    <div className="min-h-full bg-surface-dark p-5 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white md:text-3xl">Videos de fondo</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administra las URLs y elige un video distinto para escritorio y móvil.
        </p>
      </div>
      <VideosEditor
        initialVideos={videos}
        initialSeleccion={{
          WEB: seleccion.find((item) => item.tipo === 'WEB')?.video_id ?? null,
          MOVIL: seleccion.find((item) => item.tipo === 'MOVIL')?.video_id ?? null,
        }}
      />
    </div>
  )
}