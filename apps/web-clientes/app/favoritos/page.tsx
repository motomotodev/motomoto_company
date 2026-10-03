import { redirect } from 'next/navigation'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import MisFavoritos from '@/components/ui/mis-favoritos'
import PageModal from '@/components/ui/page-modal'

export const dynamic = 'force-dynamic'

export default async function FavoritosPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login?redirect=%2Ffavoritos')

  const [restaurantes, platos] = await Promise.all([
    sql`
      SELECT r.id, r.slug, r.nombre, r.logo_url, r.direccion_fisica, r.calificacion, r.num_resenas
      FROM favoritos f
      INNER JOIN restaurantes r ON r.id = f.restaurante_id
      WHERE f.usuario_id = ${user.id} AND r.activo = TRUE
      ORDER BY f.creado_en DESC
    `,
    sql`
      SELECT p.id, p.nombre, p.descripcion, p.precio, p.imagen_url, p.disponible,
             r.slug AS restaurante_slug, r.nombre AS restaurante_nombre
      FROM favoritos_platos f
      INNER JOIN platos p ON p.id = f.plato_id
      INNER JOIN restaurantes r ON r.id = p.restaurante_id
      WHERE f.usuario_id = ${user.id} AND r.activo = TRUE
      ORDER BY f.creado_en DESC
    `,
  ])

  return <PageModal title="Mis favoritos ♥" description="Restaurantes y comidas que guardaste para encontrar fácilmente." returnTo="/">
    <main className="mx-auto max-w-6xl">
      <div className="mb-7">
        <p className="motomoto-display text-xs font-black uppercase tracking-[.18em] text-[#ff914f]">Tu selección</p>
        <h1 className="motomoto-display mt-1 text-3xl font-black text-white md:text-4xl">Tus restaurantes y comidas guardadas</h1>
      </div>
      <MisFavoritos restaurantes={restaurantes as any[]} platos={platos as any[]} />
    </main>
  </PageModal>
}
