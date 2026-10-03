import { NextRequest } from 'next/server'
import { z } from 'zod'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

const schema = z.object({ tipo: z.enum(['restaurante', 'plato']), id: z.string().uuid(), estrellas: z.number().int().min(1).max(5) })

export async function GET() {
  const user = await getSessionUser()
  try {
    const rows = user
      ? await sql`
          SELECT tipo, id, ROUND(AVG(estrellas)::numeric, 1) AS promedio,
                 COUNT(*)::int AS cantidad,
                 MAX(estrellas) FILTER (WHERE usuario_id = ${user.id}) AS mi_calificacion
          FROM (
            SELECT 'restaurante'::text AS tipo, restaurante_id AS id, estrellas, usuario_id
            FROM calificaciones WHERE restaurante_id IS NOT NULL
            UNION ALL
            SELECT 'plato'::text AS tipo, plato_id AS id, estrellas, usuario_id
            FROM calificaciones WHERE plato_id IS NOT NULL
          ) c
          GROUP BY tipo, id
        `
      : await sql`
          SELECT tipo, id, ROUND(AVG(estrellas)::numeric, 1) AS promedio,
                 COUNT(*)::int AS cantidad, NULL::int AS mi_calificacion
          FROM (
            SELECT 'restaurante'::text AS tipo, restaurante_id AS id, estrellas
            FROM calificaciones WHERE restaurante_id IS NOT NULL
            UNION ALL
            SELECT 'plato'::text AS tipo, plato_id AS id, estrellas
            FROM calificaciones WHERE plato_id IS NOT NULL
          ) c
          GROUP BY tipo, id
        `
    return Response.json({ ok: true, autenticado: Boolean(user), data: rows })
  } catch (error) {
    console.error('GET calificaciones error:', error)
    return Response.json({ ok: false, error: 'No se pudieron cargar las calificaciones.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return Response.json({ ok: false, error: 'Inicia sesión para calificar.' }, { status: 401 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ ok: false, error: 'La calificación debe ser de 1 a 5 estrellas.' }, { status: 400 })
  const { tipo, id, estrellas } = parsed.data

  try {
    if (tipo === 'restaurante') {
      const existe = await sql`SELECT id FROM restaurantes WHERE id = ${id} AND activo = TRUE LIMIT 1`
      if (!existe.length) return Response.json({ ok: false, error: 'No encontramos ese restaurante.' }, { status: 404 })
      await sql`
        INSERT INTO calificaciones (usuario_id, restaurante_id, estrellas)
        VALUES (${user.id}, ${id}, ${estrellas})
        ON CONFLICT (usuario_id, restaurante_id) WHERE restaurante_id IS NOT NULL
        DO UPDATE SET estrellas = EXCLUDED.estrellas, actualizado_en = NOW()
      `
      await sql`
        UPDATE restaurantes r SET
          calificacion = COALESCE(a.promedio, 0),
          num_resenas = COALESCE(a.cantidad, 0)
        FROM (
          SELECT restaurante_id, ROUND(AVG(estrellas)::numeric, 1) AS promedio, COUNT(*)::int AS cantidad
          FROM calificaciones WHERE restaurante_id = ${id}
          GROUP BY restaurante_id
        ) a
        WHERE r.id = a.restaurante_id
      `
    } else {
      const existe = await sql`SELECT id FROM platos WHERE id = ${id} AND disponible = TRUE LIMIT 1`
      if (!existe.length) return Response.json({ ok: false, error: 'No encontramos esa comida disponible.' }, { status: 404 })
      await sql`
        INSERT INTO calificaciones (usuario_id, plato_id, estrellas)
        VALUES (${user.id}, ${id}, ${estrellas})
        ON CONFLICT (usuario_id, plato_id) WHERE plato_id IS NOT NULL
        DO UPDATE SET estrellas = EXCLUDED.estrellas, actualizado_en = NOW()
      `
    }

    const agregado = tipo === 'restaurante'
      ? await sql`SELECT ROUND(AVG(estrellas)::numeric, 1) AS promedio, COUNT(*)::int AS cantidad FROM calificaciones WHERE restaurante_id = ${id}`
      : await sql`SELECT ROUND(AVG(estrellas)::numeric, 1) AS promedio, COUNT(*)::int AS cantidad FROM calificaciones WHERE plato_id = ${id}`
    return Response.json({ ok: true, data: { tipo, id, promedio: agregado[0]?.promedio || 0, cantidad: agregado[0]?.cantidad || 0, mi_calificacion: estrellas } })
  } catch (error) {
    console.error('POST calificacion error:', error)
    return Response.json({ ok: false, error: 'No se pudo guardar tu calificación.' }, { status: 500 })
  }
}
