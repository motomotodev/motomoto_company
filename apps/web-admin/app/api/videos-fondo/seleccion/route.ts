import { z } from 'zod'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

const selectionSchema = z.object({
  tipo: z.enum(['WEB', 'MOVIL']),
  videoId: z.string().uuid(),
})

export async function PUT(req: Request) {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }

  try {
    const parsed = selectionSchema.safeParse(await req.json())
    if (!parsed.success) {
      return Response.json({ ok: false, error: 'Selección inválida.' }, { status: 400 })
    }

    const { tipo, videoId } = parsed.data
    const rows = await sql`
      INSERT INTO videos_fondo_config (tipo, video_id)
      SELECT ${tipo}, video.id
      FROM videos_fondo AS video
      WHERE video.id = ${videoId} AND video.tipo = ${tipo}
      ON CONFLICT (tipo) DO UPDATE
        SET video_id = EXCLUDED.video_id, actualizado_en = NOW()
      RETURNING tipo, video_id
    `

    if (!rows.length) {
      return Response.json({ ok: false, error: 'Ese video no pertenece al dispositivo seleccionado.' }, { status: 400 })
    }
    return Response.json({ ok: true, data: rows[0] })
  } catch (error) {
    console.error('PUT selección video-fondo error:', error)
    return Response.json({ ok: false, error: 'No se pudo cambiar el video seleccionado.' }, { status: 500 })
  }
}