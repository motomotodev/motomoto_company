'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/layout/logo'
import PageModal from '@/components/ui/page-modal'

export default function RecuperarPage() {
  const [celular, setCelular] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ celular }),
      })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        setError(data.error || 'Error')
        return
      }

      setExito(true)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (exito) {
    return (
      <PageModal title="¡Solicitud enviada!" description="Recibimos tu solicitud para recuperar tu cuenta." returnTo="/login">
          <div className="mx-auto w-full max-w-md text-center">
            <div className="mb-5 flex justify-center"><Logo size={68} conTexto /></div>
            <div className="text-6xl mb-6">📨</div>
            <p className="text-gray-400 mb-8">
              Te contactaremos por{' '}
              <strong className="text-white">WhatsApp</strong> al{' '}
              <strong className="text-brand">+51 {celular}</strong> en breve con
              tu nueva contraseña.
            </p>

            <div className="bg-surface border border-line rounded-2xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">¿Ya te contactaron?</p>
              <Link
                href="/login"
                className="text-brand hover:underline font-medium text-sm"
              >
                Inicia sesión aquí →
              </Link>
            </div>

            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
      </PageModal>
    )
  }

  return (
    <PageModal title="¿Olvidaste tu contraseña?" description="Ingresa tu celular y te contactaremos por WhatsApp" returnTo="/login">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-5 flex justify-center"><Logo size={68} conTexto /></div>

          <form
            onSubmit={handleSubmit}
            className="bg-surface border border-line rounded-2xl p-6 space-y-5"
          >
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
                  placeholder="999 999 999"
                  className="flex-1 bg-transparent py-4 pr-4 text-white placeholder-gray-600 focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                💬 Te enviaremos un WhatsApp con instrucciones
              </p>
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || celular.length !== 9}
              className="w-full bg-brand hover:bg-brand-dark disabled:bg-brand/40 text-black font-bold py-4 rounded-xl transition-all active:scale-[0.98]"
            >
              {loading ? 'Enviando...' : 'Solicitar recuperación'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link href="/login" className="text-brand hover:underline">
              ← Volver a iniciar sesión
            </Link>
          </p>
        </div>
    </PageModal>
  )
}
