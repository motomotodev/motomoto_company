import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import FondoDecorativo from '@/components/home/fondo-decorativo'
import Header from '@/components/layout/header'
import HomeRestaurantes, { type RestauranteHome } from '@/components/home/home-restaurantes'
import { estaAbierto } from '@/lib/horarios/esta-abierto'
import type { DireccionLocal } from '@/hooks/use-direccion-actual'

export const dynamic = 'force-dynamic'

async function obtenerRestaurantes(): Promise<RestauranteHome[]> {
  const rows = await sql`
    SELECT
      r.id, r.slug, r.nombre, r.subtitulo, r.banner_url, r.logo_url,
      r.direccion_fisica, r.tiempo_estimado, r.monto_minimo,
      r.calificacion, r.num_resenas, r.lat, r.lng,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'slug', c.slug, 'nombre', c.nombre, 'emoji', c.emoji
        )) FILTER (WHERE c.id IS NOT NULL),
        '[]'::json
      ) AS categorias,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'dia', h.dia,
          'hora_apertura', h.hora_apertura,
          'hora_cierre', h.hora_cierre
        )) FILTER (WHERE h.id IS NOT NULL),
        '[]'::json
      ) AS horarios
    FROM restaurantes r
    LEFT JOIN restaurantes_categorias rc ON rc.restaurante_id = r.id
    LEFT JOIN categorias c ON c.id = rc.categoria_id
    LEFT JOIN horarios_atencion h ON h.restaurante_id = r.id
    WHERE r.activo = TRUE
    GROUP BY r.id
    ORDER BY r.calificacion DESC, r.nombre
  ` as unknown as (Omit<RestauranteHome, 'abierto' | 'categorias'> & {
    categorias: RestauranteHome['categorias'] | null
    horarios: { dia: string; hora_apertura: string | null; hora_cierre: string | null }[] | null
  })[]

  return rows.map((r) => ({
    ...r,
    categorias: r.categorias || [],
    abierto: estaAbierto(r.horarios || []),
  }))
}

export default async function HomePage() {
  const user = await getSessionUser()
  const restaurantes = await obtenerRestaurantes()
  let direccionDeBD: DireccionLocal | null = null

  if (user) {
    const direcciones = await sql`
      SELECT id, etiqueta, direccion, referencia, lat, lng
      FROM direcciones
      WHERE usuario_id = ${user.id} AND es_predeterminada = TRUE
      LIMIT 1
    `
    direccionDeBD = (direcciones[0] as DireccionLocal | undefined) || null
  }

  return (
    <>
      <FondoDecorativo />
      <Header user={user} direccionDeBD={direccionDeBD} />
      <main className="relative z-10">
        <HomeRestaurantes restaurantes={restaurantes} direccionDeBD={direccionDeBD} />
      </main>
    </>
  )
}
