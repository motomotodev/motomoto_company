import { sql } from '@/lib/db'

export async function GET() {
  try {
    const data = await sql`
      SELECT id, slug, nombre, emoji
      FROM categorias
      ORDER BY orden, nombre
    `
    return Response.json({ ok: true, data }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('GET categorías públicas error:', error)
    return Response.json({ ok: false, data: [] }, { status: 503 })
  }
}
