import { sql } from '@/lib/db'

export async function GET() {
  try {
    const rows = await sql`
      SELECT redes_sociales
      FROM configuracion_sistema
      WHERE id = 1
      LIMIT 1
    ` as { redes_sociales: Record<string, string | null> | null }[]

    return Response.json(
      { ok: true, data: rows[0]?.redes_sociales ?? {} },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('GET redes sociales públicas error:', error)
    return Response.json({ ok: false, data: {} }, { status: 503 })
  }
}
