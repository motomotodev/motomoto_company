import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import Header from '@/components/layout/header'
import HomeRestaurantes, { type PlatoHome, type RestauranteHome } from '@/components/home/home-restaurantes'
import { estaAbierto } from '@/lib/horarios/esta-abierto'
import type { DireccionLocal } from '@/hooks/use-direccion-actual'

export const dynamic = 'force-dynamic'

async function obtenerRestaurantes(): Promise<Omit<RestauranteHome, 'platos'>[]> {
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

async function obtenerPlatosActivos(): Promise<Map<string, PlatoHome[]>> {
  const [platosRows, opcionesRows] = await Promise.all([
    sql`
      SELECT p.id, p.restaurante_id, p.nombre, p.descripcion, p.precio, p.imagen_url,
             p.tiempo_estimado, p.disponible, p.subcategoria_id, s.nombre AS subcategoria_nombre,
             p.orden
      FROM platos p
      INNER JOIN restaurantes r ON r.id = p.restaurante_id AND r.activo = TRUE
      LEFT JOIN subcategorias s ON s.id = p.subcategoria_id
      ORDER BY r.nombre, p.orden, p.nombre
    `,
    sql`
      SELECT g.plato_id, g.id AS grupo_id, g.titulo, g.requerido, g.minimo, g.maximo, g.orden,
             c.id AS choice_id, c.nombre AS choice_nombre, c.precio_extra, c.orden AS choice_orden
      FROM grupos_opciones g
      INNER JOIN platos p ON p.id = g.plato_id
      INNER JOIN restaurantes r ON r.id = p.restaurante_id AND r.activo = TRUE
      LEFT JOIN opciones_choices c ON c.grupo_id = g.id
      ORDER BY g.orden, c.orden, c.nombre
    `,
  ]) as [any[], any[]]

  const gruposPorPlato = new Map<string, PlatoHome['grupos']>()
  for (const row of opcionesRows) {
    const grupos = gruposPorPlato.get(row.plato_id) || []
    let grupo = grupos.find((item) => item.id === row.grupo_id)
    if (!grupo) {
      grupo = { id: row.grupo_id, titulo: row.titulo, requerido: row.requerido, minimo: row.minimo, maximo: row.maximo, choices: [] }
      grupos.push(grupo)
      gruposPorPlato.set(row.plato_id, grupos)
    }
    if (row.choice_id) grupo.choices.push({ id: row.choice_id, nombre: row.choice_nombre, precio_extra: row.precio_extra })
  }

  const menus = new Map<string, PlatoHome[]>()
  for (const row of platosRows) {
    const lista = menus.get(row.restaurante_id) || []
    lista.push({
      id: row.id,
      restaurante_id: row.restaurante_id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      precio: row.precio,
      imagen_url: row.imagen_url,
      tiempo_estimado: row.tiempo_estimado,
      disponible: row.disponible,
      subcategoria_id: row.subcategoria_id,
      subcategoria_nombre: row.subcategoria_nombre,
      grupos: gruposPorPlato.get(row.id) || [],
    })
    menus.set(row.restaurante_id, lista)
  }
  return menus
}

export default async function HomePage() {
  const user = await getSessionUser()
  const [restaurantesBase, menus, config] = await Promise.all([
    obtenerRestaurantes(),
    obtenerPlatosActivos(),
    sql`SELECT costo_vip FROM configuracion_sistema WHERE id = 1 LIMIT 1` as Promise<any[]>,
  ])
  const restaurantes: RestauranteHome[] = restaurantesBase.map((restaurante) => ({
    ...restaurante,
    platos: menus.get(restaurante.id) || [],
  }))
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
    <div className="min-h-screen bg-white text-black">
      <Header user={user} direccionDeBD={direccionDeBD} />
      <main className="relative z-10">
        <HomeRestaurantes restaurantes={restaurantes} direccionDeBD={direccionDeBD} estaLogueado={Boolean(user)} costoVip={Number(config[0]?.costo_vip || 0)} />
      </main>
    </div>
  )
}
