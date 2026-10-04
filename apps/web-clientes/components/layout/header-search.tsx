'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Categoria { id: string; slug: string; nombre: string; emoji: string | null }
interface Local { id: string; slug: string; nombre: string; subtitulo?: string | null }
interface Plato { id: string; nombre: string; restaurante_slug: string; restaurante_nombre: string }
interface Resultados { restaurantes: Local[]; platos: Plato[] }

const RECENT_KEY = 'motomoto-busquedas-recientes'

function normalizar(value: string) {
  return value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function SearchPanel({
  query, categories, recent, results, loading, onRecent, onCategory, onResult,
  onClearRecent,
}: {
  query: string; categories: Categoria[]; recent: string[]; results: Resultados
  loading: boolean; onRecent: (query: string) => void
  onCategory: (category: Categoria) => void
  onResult: (href: string, label: string) => void
  onClearRecent: () => void
}) {
  const q = normalizar(query.trim())
  const categoriesFound = q ? categories.filter((category) => normalizar(category.nombre).includes(q)).slice(0, 3) : categories.slice(0, 8)
  const restaurantsFound = q ? results.restaurantes.slice(0, 4) : []
  const dishesFound = q ? results.platos.slice(0, 5) : []

  if (!query.trim()) {
    return (
      <div className="space-y-2 p-2">
        {recent.length > 0 && <>
          <div className="flex items-center justify-between px-3 pt-2">
            <p className="motomoto-display text-[11px] font-extrabold uppercase tracking-[.14em] text-brand-light">Recientes</p>
            <button type="button" onClick={onClearRecent} className="text-[11px] font-semibold text-white/50 hover:text-white">Borrar</button>
          </div>
          <div className="flex flex-wrap gap-2 px-2 pb-2">
            {recent.map((item) => <button key={item} type="button" onClick={() => onRecent(item)} className="motomoto-display rounded-full border border-white/15 bg-white/[.06] px-3 py-2 text-xs text-white transition hover:bg-white/15">◷ {item}</button>)}
          </div>
        </>}
        <p className="motomoto-display px-3 pt-2 text-[11px] font-extrabold uppercase tracking-[.14em] text-brand-light">Categorías populares</p>
        <div className="flex flex-wrap gap-2 px-2 pb-2">
          {categoriesFound.map((category) => <button key={category.id} type="button" onClick={() => onCategory(category)} className="motomoto-display rounded-full border border-white/15 bg-white/[.06] px-3 py-2 text-xs font-bold text-white transition hover:border-brand/50 hover:bg-white/15">{category.emoji || '🍽️'} {category.nombre}</button>)}
          {categoriesFound.length === 0 && <p className="px-2 pb-2 text-xs text-white/50">Las categorías aparecerán aquí cuando estén disponibles.</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1 p-2">
      {loading && <p className="px-3 py-2 text-xs text-white/55">Buscando en MotoMoto…</p>}
      {!loading && categoriesFound.length > 0 && <>
        <p className="motomoto-display px-3 pb-1 pt-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-brand-light">Categorías</p>
        {categoriesFound.map((category) => <button key={category.id} type="button" onClick={() => onCategory(category)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-white transition hover:bg-white/10"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-lg">{category.emoji || '🍽️'}</span><span className="flex-1 text-sm font-semibold">{category.nombre}</span><span className="text-white/40">›</span></button>)}
      </>}
      {!loading && restaurantsFound.length > 0 && <>
        <p className="motomoto-display px-3 pb-1 pt-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-brand-light">Locales</p>
        {restaurantsFound.map((local) => <button key={local.id} type="button" onClick={() => onResult(`/restaurante/${local.slug}`, local.nombre)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-white transition hover:bg-white/10"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-lg">🏪</span><span className="min-w-0 flex-1"><b className="block truncate text-sm">{local.nombre}</b><small className="block truncate text-xs text-white/50">{local.subtitulo || 'Restaurante'}</small></span><span className="text-white/40">›</span></button>)}
      </>}
      {!loading && dishesFound.length > 0 && <>
        <p className="motomoto-display px-3 pb-1 pt-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-brand-light">Platos</p>
        {dishesFound.map((plato) => <button key={plato.id} type="button" onClick={() => onResult(`/restaurante/${plato.restaurante_slug}`, `${plato.nombre} · ${plato.restaurante_nombre}`)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-white transition hover:bg-white/10"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-lg">🍽️</span><span className="min-w-0 flex-1"><b className="block truncate text-sm">{plato.nombre}</b><small className="block truncate text-xs text-white/50">{plato.restaurante_nombre}</small></span><span className="text-white/40">›</span></button>)}
      </>}
      {!loading && categoriesFound.length === 0 && restaurantsFound.length === 0 && dishesFound.length === 0 && <div className="grid justify-items-center gap-1 px-4 py-5 text-center"><span className="text-3xl">🔎</span><b className="text-sm text-white">Sin resultados para “{query}”</b><small className="text-xs text-white/50">Prueba otra palabra o elige una categoría</small><div className="mt-2 flex flex-wrap justify-center gap-2">{categories.slice(0, 5).map((category) => <button key={category.id} type="button" onClick={() => onCategory(category)} className="motomoto-display rounded-full border border-white/15 bg-white/[.06] px-3 py-2 text-xs text-white">{category.emoji || '🍽️'} {category.nombre}</button>)}</div></div>}
    </div>
  )
}

export default function HeaderSearch({ mobileInline = false }: { mobileInline?: boolean }) {
  const router = useRouter()
  const desktopInput = useRef<HTMLInputElement>(null)
  const mobileInput = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [categories, setCategories] = useState<Categoria[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [results, setResults] = useState<Resultados>({ restaurantes: [], platos: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
      if (Array.isArray(stored)) setRecent(stored.filter((item): item is string => typeof item === 'string').slice(0, 5))
    } catch {}
    fetch('/api/categorias', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => data.ok && setCategories(data.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) { setResults({ restaurantes: [], platos: [] }); setLoading(false); return }
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setLoading(true)
      fetch(`/api/buscar?q=${encodeURIComponent(term)}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => { if (data.ok) setResults(data.data) })
        .catch(() => {})
        .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    }, 220)
    return () => { clearTimeout(timer); controller.abort() }
  }, [query])

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      if ((event.key === '/' && !isTyping) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault()
        setOpen(true)
        desktopInput.current?.focus()
      }
      if (event.key === 'Escape') { setOpen(false); setMobileOpen(false) }
    }
    window.addEventListener('keydown', onShortcut)
    return () => window.removeEventListener('keydown', onShortcut)
  }, [])

  const buscar = (term = query) => {
    const limpio = term.trim()
    if (!limpio) return
    const actualizado = [limpio, ...recent.filter((item) => normalizar(item) !== normalizar(limpio))].slice(0, 5)
    setRecent(actualizado)
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(actualizado)) } catch {}
    setOpen(false)
    setMobileOpen(false)
    router.push(`/buscar?q=${encodeURIComponent(limpio)}`)
  }

  const elegirCategoria = (category: Categoria) => {
    setOpen(false); setMobileOpen(false); setQuery('')
    router.push(`/?categoria=${encodeURIComponent(category.slug)}`)
  }
  const elegirResultado = (href: string, label: string) => {
    const actualizado = [label, ...recent.filter((item) => normalizar(item) !== normalizar(label))].slice(0, 5)
    setRecent(actualizado)
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(actualizado)) } catch {}
    setOpen(false); setMobileOpen(false); setQuery('')
    router.push(href)
  }
  const openMobileSearch = () => {
    setMobileOpen(true)
    window.setTimeout(() => mobileInput.current?.focus(), 0)
  }
  const onClearRecent = () => {
    setRecent([])
    try { localStorage.removeItem(RECENT_KEY) } catch {}
  }
  const onRecent = (value: string) => {
    setQuery(value)
    if (mobileOpen) mobileInput.current?.focus()
    else desktopInput.current?.focus()
  }
  const props = { query, categories, recent, results, loading, onRecent, onCategory: elegirCategoria, onResult: elegirResultado, onClearRecent }

  return (
    <>
      {open && <button type="button" aria-label="Cerrar búsqueda" onClick={() => setOpen(false)} className="fixed inset-0 z-30 hidden bg-black/30 backdrop-blur-[2px] md:block" />}
      <form onSubmit={(event) => { event.preventDefault(); buscar() }} className={`relative z-40 hidden min-w-0 flex-1 md:block ${open ? 'md:z-[60]' : ''}`}>
        <div className={`flex h-12 items-center gap-3 rounded-full border bg-black/45 px-4 transition ${open ? 'border-white/45 bg-black/80' : 'border-white/15 hover:border-white/30'}`}>
          <span className="text-xl leading-none text-white/80">⌕</span>
          <input ref={desktopInput} value={query} onFocus={() => setOpen(true)} onChange={(e) => setQuery(e.target.value)} placeholder="Prueba ‘sushi’…" aria-label="Buscar locales y platos" aria-expanded={open} className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/55" autoComplete="off" />
          {query ? <button type="button" onClick={() => setQuery('')} aria-label="Limpiar búsqueda" className="text-white/60 hover:text-white">✕</button> : <kbd className="rounded-md border border-white/20 px-2 py-0.5 font-mono text-[10px] text-white/50">/</kbd>}
        </div>
        {open && <div className="absolute left-0 right-0 top-[calc(100%+10px)] max-h-[min(66dvh,480px)] overflow-y-auto rounded-[24px] border border-white/15 bg-[#090a0d]/95 shadow-2xl shadow-black/60 backdrop-blur-2xl"><SearchPanel {...props} /></div>}
      </form>

      {mobileInline ? (
        <button type="button" onClick={openMobileSearch} aria-label="Buscar restaurantes y platos" className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-full border border-white/20 bg-[#111] px-3.5 text-left text-sm text-white/65 transition hover:border-white/35">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] shrink-0 fill-none stroke-current stroke-[1.8]"><circle cx="10.8" cy="10.8" r="6.8"/><path strokeLinecap="round" d="m16 16 5 5"/></svg>
          <span className="truncate">Buscar sushi, platos o restaurantes…</span>
        </button>
      ) : <button type="button" onClick={openMobileSearch} aria-label="Buscar" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-black/45 text-xl text-white md:hidden">⌕</button>}
      {mobileOpen && <div className="fixed inset-0 z-[80] flex flex-col bg-black/85 p-3 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-2xl md:hidden">
        <form onSubmit={(event) => { event.preventDefault(); buscar() }} className="flex h-12 shrink-0 items-center gap-3 rounded-full border border-white/25 bg-black/65 px-4">
          <button type="button" onClick={() => setMobileOpen(false)} aria-label="Volver" className="text-xl text-white/70">←</button>
          <input ref={mobileInput} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Prueba ‘sushi’…" aria-label="Buscar locales y platos" className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/50" autoComplete="off" />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Limpiar búsqueda" className="text-white/60">✕</button>}
        </form>
        <div className="mt-3 min-h-0 flex-1 overflow-y-auto rounded-[24px] border border-white/10 bg-[#090a0d]/90"><SearchPanel {...props} /></div>
      </div>}
    </>
  )
}
