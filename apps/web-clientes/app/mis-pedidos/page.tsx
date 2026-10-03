import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mis pedidos · MotoMoto',
  description: 'Revisa el estado de tus pedidos y tu historial',
}
import { getSessionUser } from '@/lib/auth'
import MisPedidosCliente from '@/components/pedidos/mis-pedidos-cliente'
import PageModal from '@/components/ui/page-modal'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MisPedidosPage() {
  const user = await getSessionUser()

  if (!user) {
    return (
      <PageModal title="Mis pedidos" description="Historial y seguimiento de tus pedidos" returnTo="/">
        <main className="mx-auto max-w-3xl py-8 text-center">
          <p className="text-4xl mb-3">🔒</p>
          <h1 className="text-xl font-bold text-white mb-2">
            Inicia sesión para ver tus pedidos
          </h1>
          <Link
            href="/login?redirect=/mis-pedidos"
            className="inline-block bg-brand hover:bg-brand-dark text-black font-bold px-6 py-3 rounded-xl transition-colors mt-3"
          >
            Ingresar
          </Link>
        </main>
      </PageModal>
    )
  }

  return (
    <PageModal title="Mis pedidos 📦" description="Historial y seguimiento de tus pedidos" returnTo="/">
      <main className="mx-auto max-w-3xl">
        <MisPedidosCliente />
      </main>
    </PageModal>
  )
}
