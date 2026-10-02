import { sql } from '@/lib/db'

export async function GET() {
  try {
    const rows = await sql`
      SELECT config.tipo, video.url
      FROM videos_fondo_config AS config
      LEFT JOIN videos_fondo AS video ON video.id = config.video_id
      ORDER BY config.tipo
    ` as { tipo: 'WEB' | 'MOVIL'; url: string | null }[]

    const data = { WEB: null as string | null, MOVIL: null as string | null }
    for (const row of rows) data[row.tipo] = row.url

    return Response.json({ ok: true, data }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('GET videos-fondo activo error:', error)
    return Response.json(
      { ok: false, data: { WEB: null, MOVIL: null } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}