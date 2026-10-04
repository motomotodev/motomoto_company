'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import HeaderSearch from './header-search'
import UserMenu from './user-menu'
import MapaLocalesModal, { type PuntoEntregaMapa } from '@/components/mapa/mapa-locales-modal'
import { guardarDireccionTemporal, limpiarDireccionTemporal, useDireccionActual, type DireccionLocal } from '@/hooks/use-direccion-actual'
import { ABRIR_DIRECCION_EVENT } from '@/lib/direccion-events'
import { ABRIR_PEDIDO_EVENT } from '@/lib/pedido-events'
import { useCarrito } from '@/lib/carrito/store'

type SocialKey = 'instagram' | 'tiktok' | 'facebook' | 'whatsapp' | 'youtube' | 'telegram' | 'x'
type RedesSociales = Partial<Record<SocialKey, string | null>>

const SOCIAL_LABELS: Record<SocialKey, string> = {
  instagram: 'Instagram', tiktok: 'TikTok', facebook: 'Facebook',
  whatsapp: 'WhatsApp', youtube: 'YouTube', telegram: 'Telegram', x: 'X',
}

function IconoSocial({ red }: { red: SocialKey }) {
  if (red === 'tiktok') return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px] fill-current"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
  if (red === 'whatsapp') return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]"><path strokeLinecap="round" strokeLinejoin="round" d="M20.5 3.5A11.9 11.9 0 0 0 12 .1C5.4.1.1 5.4.1 12c0 2.1.6 4.2 1.6 6L.2 23.7l6.1-1.6a12 12 0 0 0 5.7 1.5c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.2Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8.1 7.4c-.3-.7-.6-.7-.9-.7h-.8c-.3 0-.7.1-1 .5s-1.3 1.3-1.3 3.1 1.3 3.5 1.5 3.7c.2.3 2.5 4 6.1 5.4 3 .1 3.7-.7 4.4-.8.7-.1 2.2-.9 2.5-1.8.3-.9.3-1.7.2-1.8-.1-.2-.3-.3-.7-.5l-2.4-1.2c-.3-.1-.6-.2-.8.2-.2.3-.9 1.2-1.1 1.4-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.7-1.7-1-.9-1.7-2-1.9-2.3-.2-.3 0-.5.2-.7l.5-.6c.2-.2.3-.4.4-.6.1-.2 0-.4 0-.6z" /></svg>
  if (red === 'facebook') return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px] fill-current"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.025 4.388 11.017 10.125 11.927v-8.437H7.078v-3.49h3.047V9.43c0-3.023 1.792-4.694 4.533-4.694 1.312 0 2.686.237 2.686.237v2.97H15.83c-1.491 0-1.956.932-1.956 1.89v2.24h3.328l-.532 3.49h-2.796V24C19.612 23.09 24 18.098 24 12.073Z" /></svg>
  if (red === 'instagram') return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px] fill-none stroke-current stroke-[1.8]"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" className="fill-current stroke-0"/></svg>
  if (red === 'youtube') return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px] fill-current"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" /></svg>
  if (red === 'telegram') return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px] fill-current"><path d="m21.5 3.5-18.7 7.2c-.9.4-.9 1.1-.2 1.3l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3-14.5c.3-1.2-.4-1.7-1.3-1.4ZM9.1 13.2l9.2-5.8c.5-.3.9-.1.5.2l-7.6 6.9-.3 3.1-1.8-4.4Z" /></svg>
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px] fill-current"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.59-6.64 7.59H.47l8.6-9.83L0 1.15h7.59l5.25 6.94ZM17.61 20.64h2.04L6.49 3.24H4.3Z" /></svg>
}

function SocialLinks({ links }: { links: RedesSociales }) {
  const redes = (Object.keys(SOCIAL_LABELS) as SocialKey[]).filter((key) => typeof links[key] === 'string' && links[key]!.startsWith('https://'))
  if (!redes.length) return null

  return (
    <div className="relative shrink-0">
      <nav aria-label="Redes sociales de MotoMoto" className="hidden items-center gap-1.5 lg:flex">
        {redes.map((red, index) => <a key={red} href={links[red]!} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_LABELS[red]} title={SOCIAL_LABELS[red]} data-social={red} style={{ animationDelay: `${index * 80}ms` }} className="mm-social-link grid h-[38px] w-[38px] place-items-center rounded-full border border-white/20 bg-white/[.12] text-white"><IconoSocial red={red} /></a>)}
      </nav>
      <details className="group lg:hidden">
        <summary aria-label="Ver redes sociales de MotoMoto" className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-full border border-white/20 bg-white/[.08] text-white [&::-webkit-details-marker]:hidden"><svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg></summary>
        <nav aria-label="Redes sociales de MotoMoto" className="absolute right-0 top-11 z-50 grid min-w-48 gap-1 rounded-2xl border border-white/15 bg-[#090a0d]/95 p-2 shadow-2xl backdrop-blur-2xl">
          {redes.map((red, index) => <a key={red} href={links[red]!} target="_blank" rel="noopener noreferrer" data-social={red} style={{ animationDelay: `${index * 45}ms` }} className="mm-social-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/85"><span className="grid h-7 w-7 place-items-center rounded-full bg-white/10"><IconoSocial red={red} /></span>{SOCIAL_LABELS[red]}</a>)}
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
  const router = useRouter()
  const [mapaAbierto, setMapaAbierto] = useState(false)
  const [iniciarMapaEnDirecciones, setIniciarMapaEnDirecciones] = useState(false)
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
  const [redes, setRedes] = useState<RedesSociales>({})
  const direccionActual = useDireccionActual(direccionDeBD ?? null)
  const [cantidadCarrito, setCantidadCarrito] = useState(0)

  useEffect(() => {
    const actualizarCantidad = () => setCantidadCarrito(useCarrito.getState().totalItems())
    actualizarCantidad()
    return useCarrito.subscribe(actualizarCantidad)
  }, [])

  useEffect(() => {
    fetch('/api/redes-sociales', { cache: 'no-store' })
      .then((response) => response.json())
      .then((result) => { if (result.ok) setRedes(result.data || {}) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const abrirDesdeOtraSeccion = () => {
      setIniciarMapaEnDirecciones(Boolean(user))
      setMapaAbierto(true)
    }
    window.addEventListener(ABRIR_DIRECCION_EVENT, abrirDesdeOtraSeccion)
    return () => window.removeEventListener(ABRIR_DIRECCION_EVENT, abrirDesdeOtraSeccion)
  }, [user])

  async function confirmarUbicacionMapa(direccion: PuntoEntregaMapa) {
    if (user) {
      const editando = Boolean(direccion.id)
      const response = await fetch(editando ? `/api/direcciones/${direccion.id}` : '/api/direcciones', {
        method: editando ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etiqueta: direccion.etiqueta,
          direccion: direccion.direccion,
          referencia: direccion.referencia,
          lat: direccion.lat,
          lng: direccion.lng,
          es_predeterminada: direccion.es_predeterminada ?? true,
        }),
      })
      const result = await response.json()
      if (!response.ok || !result.ok) throw new Error(result.error || 'No se pudo guardar la dirección.')
      limpiarDireccionTemporal()
    } else {
      guardarDireccionTemporal({
        etiqueta: direccion.etiqueta,
        direccion: direccion.direccion,
        referencia: direccion.referencia,
        lat: direccion.lat,
        lng: direccion.lng,
        es_predeterminada: true,
      })
    }
    router.refresh()
  }

  return (
    <>
      <header className="mm-mobile-header relative z-40 md:hidden">
        <div className="mm-mobile-topbar">
          <button type="button" onClick={() => setMenuMovilAbierto((open) => !open)} aria-label={menuMovilAbierto ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuMovilAbierto} className="mm-mobile-icon-button">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current stroke-[1.8]"><path strokeLinecap="round" d={menuMovilAbierto ? 'm6 6 12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'} /></svg>
          </button>
          <Link href="/" aria-label="MotoMoto, inicio" className="mm-mobile-brand">
            <Image src="/logo-motomoto.png" alt="" width={30} height={36} priority className="h-8 w-7 object-contain" />
            <span>Moto<span>Moto</span></span>
          </Link>
          <div className="mm-mobile-actions">
            <button type="button" onClick={() => router.push(user ? '/perfil' : '/login')} aria-label={user ? `Mi perfil, ${user.nombre}` : 'Iniciar sesión'} className="mm-mobile-icon-button">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[22px] w-[22px] fill-none stroke-current stroke-[1.6]"><circle cx="12" cy="8" r="3.6"/><path strokeLinecap="round" strokeLinejoin="round" d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>
            </button>
            <button type="button" onClick={() => window.dispatchEvent(new Event(ABRIR_PEDIDO_EVENT))} aria-label={`Mi pedido${cantidadCarrito ? `, ${cantidadCarrito} productos` : ''}`} className="mm-mobile-icon-button relative">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[23px] w-[23px] fill-none stroke-current stroke-[1.6]"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.1 11.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 1.9-1.4L22 8H6"/><circle cx="10" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/></svg>
              {cantidadCarrito > 0 && <span className="mm-mobile-cart-count">{cantidadCarrito > 9 ? '9+' : cantidadCarrito}</span>}
            </button>
          </div>
        </div>
        <div className="mm-mobile-search-row">
          <HeaderSearch mobileInline />
          <button type="button" aria-label="Ir a categorías y filtros" onClick={() => document.getElementById('restaurant-categories')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="mm-mobile-filter-button">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[21px] w-[21px] fill-none stroke-current stroke-[1.65]"><path strokeLinecap="round" d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>
          </button>
        </div>
        {menuMovilAbierto && <nav aria-label="Menú principal" className="mm-mobile-menu">
          <Link href="/" onClick={() => setMenuMovilAbierto(false)}>Inicio</Link>
          {user ? <>
            <Link href="/mis-pedidos" onClick={() => setMenuMovilAbierto(false)}>Mis pedidos</Link>
            <Link href="/favoritos" onClick={() => setMenuMovilAbierto(false)}>Mis favoritos</Link>
            <Link href="/perfil" onClick={() => setMenuMovilAbierto(false)}>Mi perfil</Link>
          </> : <Link href="/login" onClick={() => setMenuMovilAbierto(false)}>Iniciar sesión</Link>}
          <button type="button" onClick={() => { setMenuMovilAbierto(false); setIniciarMapaEnDirecciones(Boolean(user)); setMapaAbierto(true) }}>🗺️ Mapa y direcciones</button>
        </nav>}
      </header>

      <header className="relative z-40 mx-auto mt-2 hidden w-[calc(100%-24px)] max-w-6xl rounded-full border border-white/15 bg-black/55 px-3 py-2 shadow-xl shadow-black/25 backdrop-blur-xl md:block md:px-5">
        <div className="flex min-h-11 items-center gap-2 md:gap-4">
          <Link href="/" aria-label="MotoMoto, inicio" className="flex shrink-0 items-center gap-1.5">
            <Image src="/logo-motomoto.png" alt="MotoMoto" width={40} height={48} priority className="h-11 w-9 object-contain" />
            <span className="motomoto-display hidden whitespace-nowrap text-[19px] font-black italic text-white sm:block">Moto<span className="text-brand-light">Moto</span></span>
          </Link>

          <HeaderSearch />

          <button type="button" onClick={() => { setIniciarMapaEnDirecciones(Boolean(user)); setMapaAbierto(true) }} aria-label="Abrir mapa de locales y entregas" title="Mapa de locales y entregas" className="motomoto-map-cta group relative flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/35 bg-gradient-to-br from-[#3158ef] to-[#1c36bc] px-3 text-xs font-black text-white shadow-[0_5px_20px_rgba(37,73,220,.34)] transition duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-[0_7px_24px_rgba(255,118,40,.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 md:h-11 md:px-4">
            <span aria-hidden="true" className="text-base leading-none transition-transform duration-200 group-hover:rotate-[-8deg] group-hover:scale-110">🗺️</span>
            <span>Mapa</span>
            <span aria-hidden="true" className="grid h-4 w-4 place-items-center rounded-full bg-[#ff7628] text-[10px] leading-none text-white shadow-sm">+</span>
          </button>

          <SocialLinks links={redes} />

          {user ? <UserMenu nombre={user.nombre} celular={user.celular} /> : <Link href="/login" className="motomoto-login-cta motomoto-display flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#ff7628] px-3.5 py-2.5 text-[11px] font-black italic text-white md:px-5 md:text-xs"><span className="motomoto-login-persona" aria-hidden="true">👤</span>Login</Link>}
        </div>
      </header>

      <MapaLocalesModal open={mapaAbierto} onClose={() => setMapaAbierto(false)} onConfirmarUbicacion={confirmarUbicacionMapa} direccionActual={direccionActual} mostrarDirecciones={Boolean(user)} vistaInicial={iniciarMapaEnDirecciones ? 'direcciones' : 'locales'} onDireccionSeleccionada={() => router.refresh()} />
    </>
  )
}
