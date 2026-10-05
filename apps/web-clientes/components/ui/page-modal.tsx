'use client'

import { useCallback, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  title: string
  description?: string
  returnTo?: string
  children: ReactNode
}

export default function PageModal({ title, description, returnTo = '/', children }: Props) {
  const router = useRouter()
  const destino = returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/'
  const cerrar = useCallback(() => {
    const index = window.history.state?.idx
    if (typeof index === 'number' && index > 0) router.back()
    else router.replace(destino)
  }, [destino, router])

  useEffect(() => {
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') cerrar() }
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = overflow; window.removeEventListener('keydown', onKeyDown) }
  }, [cerrar])

  return <div className="fixed inset-0 z-[80] grid place-items-center bg-[#061d45]/80 p-0 backdrop-blur-md md:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) cerrar() }}>
    <section role="dialog" aria-modal="true" aria-label={title} className="mm-page-modal-enter flex h-[100dvh] w-full flex-col overflow-hidden border border-blue-200/25 bg-[#0b3473]/95 text-white shadow-2xl backdrop-blur-2xl md:h-[min(90dvh,860px)] md:max-w-3xl md:rounded-[28px]">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/20 bg-[#1877f2] px-5 py-4 md:px-7 md:py-5">
        <div className="min-w-0"><p className="motomoto-display text-lg font-black uppercase tracking-wide text-white md:text-xl">{title}</p>{description && <p className="mt-1 text-xs text-white/55 md:text-sm">{description}</p>}</div>
        <button type="button" autoFocus onClick={cerrar} aria-label={`Cerrar ${title}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-lg text-white transition hover:rotate-90 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-200">✕</button>
      </header>
      <div className="mm-page-modal-content min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 md:px-8 md:py-7">{children}</div>
    </section>
  </div>
}
