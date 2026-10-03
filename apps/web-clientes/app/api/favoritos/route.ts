import { NextRequest } from 'next/server'
import { z } from 'zod'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

const schema = z.object({ tipo: z.enum(['restaurante', 'plato']), id: z.string().uuid() })

export async function GET() {
  const user = await getSessionUser()
  if (!user) return Response.json({ ok: true, autenticado: false, restaurantes: [], platos: [] })

  try {
    const [restaurantes, platos] = await Promise.all([
      sql`SELECT restaurante_id AS id FROM favoritos WHERE usuario_id = ${user.id}`,
      sql`SELECT plato_id AS id FROM favoritos_platos WHERE usuario_id = ${user.id}`,
    ])
    return Response.json({ ok: true, autenticado: true, restaurantes: (restaurantes as { id: string }[]).map((r) => r.id), platos: (platos as { id: string }[]).map((p) => p.id) })
  } catch (error) {
    console.error('GET favoritos error:', error)
    return Response.json({ ok: false, error: 'No se pudieron cargar tus favoritos.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return Response.json({ ok: false, error: 'Inicia sesión para guardar favoritos.' }, { status: 401 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ ok: false, error: 'Favorito inválido.' }, { status: 400 })
  const { tipo, id } = parsed.data

  try {
    if (tipo === 'restaurante') {
      const existe = await sql`SELECT id FROM restaurantes WHERE id = ${id} AND activo = TRUE LIMIT 1`
      if (!existe.length) return Response.json({ ok: false, error: 'No encontramos ese restaurante.' }, { status: 404 })
      await sql`INSERT INTO favoritos (usuario_id, restaurante_id) VALUES (${user.id}, ${id}) ON CONFLICT DO NOTHING`
    } else {
      const existe = await sql`SELECT id FROM platos WHERE id = ${id} LIMIT 1`
      if (!existe.length) return Response.json({ ok: false, error: 'No encontramos esa comida.' }, { status: 404 })
      await sql`INSERT INTO favoritos_platos (usuario_id, plato_id) VALUES (${user.id}, ${id}) ON CONFLICT DO NOTHING`
    }
    return Response.json({ ok: true, favorito: true })
  } catch (error) {
    console.error('POST favorito error:', error)
    return Response.json({ ok: false, error: 'No se pudo guardar el favorito.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return Response.json({ ok: false, error: 'Inicia sesión para gestionar tus favoritos.' }, { status: 401 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ ok: false, error: 'Favorito inválido.' }, { status: 400 })
  const { tipo, id } = parsed.data

  try {
    if (tipo === 'restaurante') await sql`DELETE FROM favoritos WHERE usuario_id = ${user.id} AND restaurante_id = ${id}`
    else await sql`DELETE FROM favoritos_platos WHERE usuario_id = ${user.id} AND plato_id = ${id}`
    return Response.json({ ok: true, favorito: false })
  } catch (error) {
    console.error('DELETE favorito error:', error)
    return Response.json({ ok: false, error: 'No se pudo quitar el favorito.' }, { status: 500 })
  }
}
