'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/layout/logo'
import PageModal from '@/components/ui/page-modal'

function RegistroForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [nombre, setNombre] = useState('')
  const [celular, setCelular] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (celular.length !== 9) {
      setError('El celular debe tener 9 dígitos')
      return
    }
    if (password.length < 12) {
      setError('La contraseña debe tener al menos 12 caracteres')
      return
    }

    setLoading(true)

    try {
      let direccionTemporal = null
      try {
        const raw = localStorage.getItem('motomoto-direccion-temporal')
        if (raw) direccionTemporal = JSON.parse(raw)
      } catch {}

      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          celular,
          nombre,
          password,
          direccion_temporal: direccionTemporal,
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        setError(data.error || 'Error al registrarte')
        setLoading(false)
        return
      }

      if (direccionTemporal) {
        localStorage.removeItem('motomoto-direccion-temporal')
      }

      router.push(redirect)
      router.refresh()
    } catch {
      setError('Error de conexión')
      setLoading(false)
    }
  }

  return (
    <PageModal title="Crea tu cuenta 🚀" description="Solo necesitas 3 datos para empezar a pedir" returnTo={redirect}>
        <div className="mx-auto w-full max-w-md">
          <div className="mb-5 flex justify-center"><Logo size={68} conTexto /></div>

          <form
            onSubmit={handleSubmit}
            className="bg-surface border border-line rounded-2xl p-6 space-y-5"
          >
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                autoComplete="name"
                placeholder="Juan Pérez"
                className="w-full px-4 py-4 bg-surface-dark border border-line-light rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Celular
              </label>
              <div className="flex items-center bg-surface-dark border border-line-light rounded-xl focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 transition-all">
                <span className="pl-4 pr-2 text-gray-500 font-medium">
                  +51
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={celular}
                  onChange={(e) =>
                    setCelular(e.target.value.replace(/\D/g, '').slice(0, 9))
                  }
                  required
                  autoComplete="tel"
                  placeholder="999 999 999"
                  className="flex-1 bg-transparent py-4 pr-4 text-white placeholder-gray-600 focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Lo usarás para iniciar sesión
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={12}
                autoComplete="new-password"
                placeholder="Mínimo 12 caracteres"
                className="w-full px-4 py-4 bg-surface-dark border border-line-light rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-dark disabled:bg-brand/40 text-black font-bold py-4 rounded-xl transition-all active:scale-[0.98]"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link
              href={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="text-brand hover:underline font-medium"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
    </PageModal>
  )
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<PageModal title="Crea tu cuenta 🚀" description="Solo necesitas 3 datos para empezar a pedir"><div className="mx-auto h-72 max-w-md animate-pulse rounded-2xl bg-white/5" /></PageModal>}>
      <RegistroForm />
    </Suspense>
  )
}
