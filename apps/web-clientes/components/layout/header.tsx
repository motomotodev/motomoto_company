'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import UserMenu from './user-menu'
import Logo from './logo'
import HeaderSearch from './header-search'
import MapaLocalesModal, { type PuntoEntregaMapa } from '@/components/mapa/mapa-locales-modal'
import { useCarrito } from '@/lib/carrito/store'
import { useDireccionActual, type DireccionLocal } from '@/hooks/use-direccion-actual'
import DireccionModalWrapper from '@/components/direcciones/direccion-modal-wrapper'
import DireccionesSelector from '@/components/direcciones/direcciones-selector'
import { ABRIR_DIRECCION_EVENT } from '@/lib/direccion-events'

type SocialKey = 'instagram' | 'tiktok' | 'facebook' | 'whatsapp' | 'youtube' | 'telegram' | 'x'
type RedesSociales = Partial<Record<SocialKey, string | null>>

const SOCIAL_LABELS: Record<SocialKey, string> = {
  instagram: 'Instagram', tiktok: 'TikTok', facebook: 'Facebook',
  whatsapp: 'WhatsApp', youtube: 'YouTube', telegram: 'Telegram', x: 'X',
}

function IconoSocial({ red }: { red: SocialKey }) {
  if (red === 'facebook') return <span className="font-sans text-xl font-black leading-none">f</span>
  if (red === 'x') return <span className="font-sans text-sm font-bold leading-none">𝕏</span>
  if (red === 'whatsapp') return <span className="font-sans text-[15px] font-bold leading-none">◔</span>
  if (red === 'youtube') return <span className="font-sans text-[12px] font-black leading-none">▶</span>
  if (red === 'telegram') return <span className="font-sans text-[15px] leading-none">➤</span>
  if (red === 'tiktok') return <span className="font-sans text-[17px] font-black leading-none">♪</span>
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px] fill-none stroke-current stroke-[1.8]"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" className="fill-current stroke-0"/></svg>
}

function SocialLinks({ links }: { links: RedesSociales }) {
  const redes = (Object.keys(SOCIAL_LABELS) as SocialKey[]).filter((key) => typeof links[key] === 'string' && links[key]!.startsWith('https://'))
  if (!redes.length) return null
  return (
    <div className="relative shrink-0">
      <nav aria-label="Redes sociales de MotoMoto" className="hidden items-center gap-1.5 xl:flex">
        {redes.map((red) => (
          <a key={red} href={links[red]!} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_LABELS[red]} title={SOCIAL_LABELS[red]} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/[.08] text-white/90 transition hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/20">
            <IconoSocial red={red} />
          </a>
        ))}
      </nav>
      <details className="group xl:hidden">
        <summary aria-label="Ver redes sociales de MotoMoto" className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-full border border-white/20 bg-white/[.08] text-white/90 transition hover:bg-white/20 [&::-webkit-details-marker]:hidden">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>
        </summary>
        <nav aria-label="Redes sociales de MotoMoto" className="absolute right-0 top-11 z-50 grid min-w-48 gap-1 rounded-2xl border border-white/15 bg-[#090a0d]/95 p-2 shadow-2xl backdrop-blur-2xl">
          {redes.map((red) => (
            <a key={red} href={links[red]!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/85 transition hover:bg-white/10">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10"><IconoSocial red={red} /></span>{SOCIAL_LABELS[red]}
            </a>
          ))}
        </nav>
      </details>
    </div>
  )
}

interface HeaderProps {
  user: { nombre: string; celular: string } | null
  direccionDeBD?: DireccionLocal | null
}

export default function Header({ user, direccionDeBD }: HeaderProps) {
  const [mounted, setMounted] = useState(false)
  const [modalDireccionOpen, setModalDireccionOpen] = useState(false)
  const [selectorAbierto, setSelectorAbierto] = useState(false)
  const [mapaAbierto, setMapaAbierto] = useState(false)
  const [modalGuardarMapa, setModalGuardarMapa] = useState(false)
  const [puntoMapa, setPuntoMapa] = useState<PuntoEntregaMapa | null>(null)
  const [redes, setRedes] = useState<RedesSociales>({})

  const totalItems = useCarrito((s) => s.totalItems())
  const direccionActual = useDireccionActual(direccionDeBD ?? null)

  useEffect(() => {
    setMounted(true)
    fetch('/api/redes-sociales', { cache: 'no-store' })
      .then((response) => response.json())
      .then((result) => { if (result.ok) setRedes(result.data || {}) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const abrirDesdeOtraSeccion = () => abrirDireccion()
    window.addEventListener(ABRIR_DIRECCION_EVENT, abrirDesdeOtraSeccion)
    return () => window.removeEventListener(ABRIR_DIRECCION_EVENT, abrirDesdeOtraSeccion)
  }, [user])

  function abrirDireccion() {
    if (user) setSelectorAbierto(true)
    else setModalDireccionOpen(true)
  }

  function confirmarUbicacionMapa(punto: PuntoEntregaMapa) {
    setPuntoMapa(punto)
    setMapaAbierto(false)
    setModalGuardarMapa(true)
  }

  const sinDireccion = mounted && !direccionActual

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#090b10]/90 shadow-lg shadow-black/15 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-3 py-2.5 md:px-6 md:py-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex shrink-0 items-center gap-2">
              <Logo size={40} linkeado />
              <Link href="/" className="motomoto-display hidden whitespace-nowrap text-[19px] font-black italic text-white sm:block">Moto<span className="text-brand-light">Moto</span></Link>
            </div>

            <button type="button" onClick={abrirDireccion} className={`hidden h-11 max-w-[190px] shrink-0 items-center gap-2 rounded-full px-3 text-xs transition md:flex ${direccionActual ? 'border border-white/10 bg-white/[.045] text-white/80 hover:bg-white/10' : 'border border-jaguar/35 bg-jaguar/[.08] text-jaguar hover:bg-jaguar/[.13]'}`}>
              <span>📍</span><span className="truncate">{direccionActual?.direccion || 'Añadir dirección'}</span><span className="text-white/40">⌄</span>
            </button>

            <HeaderSearch />

            <button type="button" onClick={() => setMapaAbierto(true)} aria-label="Abrir mapa de locales y entregas" title="Mapa" className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-white/25 bg-gradient-to-br from-[#3158ef] to-[#1c36bc] px-3 text-sm font-bold text-white shadow-lg shadow-brand/25 transition hover:-translate-y-0.5 md:h-11 md:px-4">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[2.2]"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.3"/></svg>
              <span className="hidden md:inline">Mapa</span>
              <span className="-mr-2 -mt-7 grid h-4 w-4 place-items-center rounded-full bg-[#ff7628] text-[10px] leading-none">+</span>
            </button>

            <SocialLinks links={redes} />

            <div className="flex shrink-0 items-center gap-2">
              <Link href="/carrito" className="relative grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/[.07] text-base transition hover:border-white/35 hover:bg-white/15 md:h-9 md:w-9" aria-label="Carrito">
                🛒
                {mounted && totalItems > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff7628] px-1 text-[9px] font-bold text-white">{totalItems > 9 ? '9+' : totalItems}</span>}
              </Link>
              {user ? <UserMenu nombre={user.nombre} celular={user.celular} /> : <Link href="/login" className="motomoto-display whitespace-nowrap rounded-full bg-[#ff7628] px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:bg-[#ff8c45]">Ingresar</Link>}
            </div>
          </div>
        </div>

        {sinDireccion && <button type="button" onClick={abrirDireccion} className="w-full border-t border-jaguar/15 bg-[#11120f]/90 px-4 py-2.5 text-left backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center gap-3 md:px-6"><span className="text-base">📍</span><div className="min-w-0 flex-1"><p className="text-xs font-bold text-jaguar">¿A dónde te llevamos?</p><p className="text-[10px] text-gray-500">Agrega tu dirección para calcular el delivery</p></div><span className="text-jaguar text-lg">›</span></div>
        </button>}

        {mounted && direccionActual && <button type="button" onClick={abrirDireccion} className="w-full border-t border-white/[0.07] bg-[#090b10]/85 px-4 py-2.5 text-left backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3 md:px-6"><span>📍</span><span className="flex-1 truncate text-xs text-gray-400">{direccionActual.direccion}</span><span className="text-brand text-xs font-bold">Cambiar</span></div>
        </button>}
      </header>

      {user && <DireccionesSelector open={selectorAbierto} onClose={() => setSelectorAbierto(false)} estaLogueado />}
      {!user && <DireccionModalWrapper open={modalDireccionOpen} onClose={() => setModalDireccionOpen(false)} estaLogueado={false} initialData={direccionActual ?? undefined} />}

      <MapaLocalesModal open={mapaAbierto} onClose={() => setMapaAbierto(false)} onConfirmarUbicacion={confirmarUbicacionMapa} direccionActual={direccionActual} />

      <DireccionModalWrapper
        open={modalGuardarMapa}
        onClose={() => setModalGuardarMapa(false)}
        estaLogueado={!!user}
        initialData={puntoMapa ? { etiqueta: 'Casa', direccion: '', referencia: '', lat: puntoMapa.lat, lng: puntoMapa.lng } : undefined}
        comenzarEnMapa
        predeterminadaAlGuardar
      />
    </>
  )
}
