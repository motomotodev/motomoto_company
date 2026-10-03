import { sql } from '@/lib/db'

export async function GET() {
  try {
    const data = await sql`
      SELECT
        r.id,
        r.slug,
        r.nombre,
        r.subtitulo,
        r.direccion_fisica,
        r.lat,
        r.lng,
        r.logo_url,
        r.calificacion,
        r.num_resenas,
        r.tiempo_estimado,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'slug', c.slug,
            'nombre', c.nombre,
            'emoji', c.emoji
          )) FILTER (WHERE c.id IS NOT NULL),
          '[]'::json
        ) AS categorias
      FROM restaurantes r
      LEFT JOIN restaurantes_categorias rc ON rc.restaurante_id = r.id
      LEFT JOIN categorias c ON c.id = rc.categoria_id
      WHERE r.activo = TRUE AND r.lat IS NOT NULL AND r.lng IS NOT NULL
      GROUP BY r.id
      ORDER BY r.nombre
    `
    return Response.json({ ok: true, data }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('GET locales del mapa error:', error)
    return Response.json({ ok: false, data: [] }, { status: 503 })
  }
}
