import { z } from 'zod'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

const idSchema = z.string().uuid()
const patchSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  url: z.string().trim().url().refine((value) => {
    try {
      const parsed = new URL(value)
      return parsed.protocol === 'https:' && /\.(mp4|webm)$/i.test(parsed.pathname)
    } catch {
      return false
    }
  }, 'Usa una URL pública HTTPS directa a un archivo MP4 o WebM.'),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  if (!idSchema.safeParse(id).success) {
    return Response.json({ ok: false, error: 'ID inválido.' }, { status: 400 })
  }

  try {
    const parsed = patchSchema.safeParse(await req.json())
    if (!parsed.success) {
      return Response.json(
        { ok: false, error: 'Revisa el nombre y que la URL HTTPS apunte a un archivo MP4 o WebM.', issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const { nombre, url } = parsed.data
    const rows = await sql`
      UPDATE videos_fondo
      SET nombre = ${nombre}, url = ${url}, actualizado_en = NOW()
      WHERE id = ${id}
      RETURNING id, tipo, nombre, url, creado_en, actualizado_en
    `
    if (!rows.length) {
      return Response.json({ ok: false, error: 'No se encontró el video.' }, { status: 404 })
    }
    return Response.json({ ok: true, data: rows[0] })
  } catch (error) {
    console.error('PATCH videos-fondo error:', error)
    return Response.json({ ok: false, error: 'No se pudo actualizar el video.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  if (!idSchema.safeParse(id).success) {
    return Response.json({ ok: false, error: 'ID inválido.' }, { status: 400 })
  }

  try {
    const rows = await sql`DELETE FROM videos_fondo WHERE id = ${id} RETURNING id`
    if (!rows.length) {
      return Response.json({ ok: false, error: 'No se encontró el video.' }, { status: 404 })
    }
    return Response.json({ ok: true })
  } catch (error) {
    console.error('DELETE videos-fondo error:', error)
    return Response.json({ ok: false, error: 'No se pudo eliminar el video.' }, { status: 500 })
  }
}