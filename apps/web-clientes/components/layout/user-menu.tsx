'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UserMenu({
  nombre,
  celular,
}: {
  nombre: string
  celular: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Cerrar al click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function logout() {
    setLoading(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    setOpen(false)
    router.refresh()
    router.push('/')
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={`Menú de cuenta de ${nombre}`}
        data-favorites-target
        className="motomoto-greeting motomoto-display flex max-w-[148px] shrink-0 items-center gap-2 rounded-full border border-orange-200/35 bg-gradient-to-r from-orange-500/20 to-black/35 py-1.5 pl-1.5 pr-3 text-left text-white shadow-[0_4px_18px_rgba(255,118,40,.12)] transition hover:border-orange-200/70 hover:bg-orange-500/25 md:max-w-[190px] md:gap-2.5 md:py-2 md:pl-2 md:pr-4"
      >
        <span className="motomoto-greeting-avatar grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#ff7628] text-sm shadow-md md:h-8 md:w-8" aria-hidden="true">👋</span>
        <span className="min-w-0"><span className="block text-[9px] font-bold uppercase tracking-[.12em] text-orange-200/85 md:text-[10px]">Hola</span><span className="block truncate text-[11px] font-black italic md:text-xs">{nombre.trim().split(/\s+/)[0]}</span></span>
        <span aria-hidden="true" className="text-[9px] text-white/70">⌄</span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-white/15 bg-[#101114]/95 shadow-2xl backdrop-blur-2xl">
          {/* Info del usuario */}
          <div className="border-b border-white/10 p-4">
            <p className="text-sm font-bold text-white truncate">{nombre}</p>
            <p className="text-xs text-gray-500">+51 {celular}</p>
          </div>

          {/* Links */}
          <div className="p-2">
            <Link
              href="/perfil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/10"
            >
              <span>👤</span>
              <span>Mi perfil</span>
            </Link>
            <Link
              href="/mis-pedidos"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/10"
            >
              <span>📦</span>
              <span>Mis pedidos</span>
            </Link>
            <Link
              href="/favoritos"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/10"
            >
              <span className="text-pink-300">♥</span>
              <span>Mis favoritos</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-white/10 p-2">
            <button
              type="button"
              onClick={logout}
              disabled={loading}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
            >
              <span>🚪</span>
              <span>{loading ? 'Cerrando...' : 'Cerrar sesión'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
