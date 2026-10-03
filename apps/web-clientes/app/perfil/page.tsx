import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mi perfil · MotoMoto',
  description: 'Gestiona tu cuenta',
}
import { getSessionUser } from '@/lib/auth'
import PerfilCliente from '@/components/perfil/perfil-cliente'
import PageModal from '@/components/ui/page-modal'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const user = await getSessionUser()

  if (!user) {
    return (
      <PageModal title="Mi perfil" description="Gestiona tu cuenta" returnTo="/">
        <main className="mx-auto max-w-3xl py-8 text-center">
          <p className="text-4xl mb-3">🔒</p>
          <h1 className="text-xl font-bold text-white mb-2">
            Inicia sesión para ver tu perfil
          </h1>
          <Link
            href="/login?redirect=/perfil"
            className="inline-block bg-brand hover:bg-brand-dark text-black font-bold px-6 py-3 rounded-xl transition-colors mt-3"
          >
            Ingresar
          </Link>
        </main>
      </PageModal>
    )
  }

  return (
    <PageModal title="Mi perfil 👤" description="Tus datos y preferencias" returnTo="/">
      <main className="mx-auto max-w-3xl">
        <PerfilCliente
          user={{
            nombre: user.nombre,
            celular: user.celular,
          }}
        />
      </main>
    </PageModal>
  )
}
