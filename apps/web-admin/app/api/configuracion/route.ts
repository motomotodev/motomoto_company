import { NextRequest } from 'next/server'
import { z } from 'zod'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

const socialUrlSchema = z.string().trim().max(500).refine((value) => {
  if (!value) return true
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}, 'Usa una URL completa que empiece con https://')

const redesSocialesSchema = z.object({
  instagram: socialUrlSchema,
  tiktok: socialUrlSchema,
  facebook: socialUrlSchema,
  whatsapp: socialUrlSchema,
  youtube: socialUrlSchema,
  telegram: socialUrlSchema,
  x: socialUrlSchema,
})

const configSchema = z.object({
  tarifa_delivery_metodo: z.enum(['DETALLADA', 'GENERAL']),
  costo_vip: z.coerce.number().min(0),
  tiempo_max_aceptacion: z.coerce.number().int().min(1),
  redes_sociales: redesSocialesSchema,
})

export async function GET() {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }

  try {
    const rows = await sql`
      SELECT tarifa_delivery_metodo, costo_vip,
             tiempo_max_aceptacion, redes_sociales, actualizado_en
      FROM configuracion_sistema
      WHERE id = 1
      LIMIT 1
    `
    return Response.json({ ok: true, data: rows[0] })
  } catch (error) {
    console.error('GET config error:', error)
    return Response.json(
      { ok: false, error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = configSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { ok: false, error: 'Datos inválidos', issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const d = parsed.data

    await sql`
      UPDATE configuracion_sistema SET
        tarifa_delivery_metodo = ${d.tarifa_delivery_metodo},
        costo_vip = ${d.costo_vip},
        tiempo_max_aceptacion = ${d.tiempo_max_aceptacion},
        redes_sociales = ${JSON.stringify(d.redes_sociales)}::jsonb,
        actualizado_en = NOW()
      WHERE id = 1
    `

    return Response.json({ ok: true })
  } catch (error) {
    console.error('PATCH config error:', error)
    return Response.json(
      { ok: false, error: 'Error al guardar' },
      { status: 500 }
    )
  }
}
