import { z } from 'zod'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

const videoSchema = z.object({
  tipo: z.enum(['WEB', 'MOVIL']),
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

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }

  try {
    const parsed = videoSchema.safeParse(await req.json())
    if (!parsed.success) {
      return Response.json(
        { ok: false, error: 'Revisa el nombre y que la URL HTTPS apunte a un archivo MP4 o WebM.', issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const { tipo, nombre, url } = parsed.data
    const rows = await sql`
      INSERT INTO videos_fondo (tipo, nombre, url)
      VALUES (${tipo}, ${nombre}, ${url})
      ON CONFLICT (tipo, url) DO UPDATE
        SET nombre = EXCLUDED.nombre, actualizado_en = NOW()
      RETURNING id, tipo, nombre, url, creado_en, actualizado_en
    `

    return Response.json({ ok: true, data: rows[0] }, { status: 201 })
  } catch (error) {
    console.error('POST videos-fondo error:', error)
    return Response.json({ ok: false, error: 'No se pudo guardar el video.' }, { status: 500 })
  }
}