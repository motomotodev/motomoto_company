'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCarrito } from '@/lib/carrito/store'
import { useToast } from '@/components/ui/toast'
import OpcionesModal from '@/components/plato/opciones-modal'
import { CalificacionEstrellas, FavoritoButton, type CalificacionResumen, type TipoPreferencia } from '@/components/ui/preferencias-cliente'
import type { CategoriaRestaurante, PlatoHome, RestauranteHome } from './home-restaurantes'
import type { EnvioInfo } from '@/hooks/use-envio'
import RestaurantMenuOverlay from './restaurant-menu-overlay'

interface Props {
  restaurantes: RestauranteHome[]
  categorias: CategoriaRestaurante[]
  envios: Record<string, EnvioInfo>
  categoriaActiva: string | null
  restauranteActivoId: string
  onCambiarCategoria: (slug: string | null) => void
  onCambiarRestaurante: (id: string) => void
  preferencias: {
    favoritos: Set<string>
    calificaciones: Record<string, CalificacionResumen>
    pendientes: Set<string>
    toggleFavorito: (tipo: TipoPreferencia, id: string, source?: HTMLElement) => Promise<void>
    calificar: (tipo: TipoPreferencia, id: string, estrellas: number) => Promise<void>
    clave: (tipo: TipoPreferencia, id: string) => string
  }
  onOpenOrder: () => void
}

const formatoSoles = (valor: string | number) => `S/ ${Number(valor || 0).toFixed(2)}`

function emojiSubcategoria(nombre: string): string {
  const value = nombre.toLocaleLowerCase()
  if (/pizza/.test(value)) return '🍕'
  if (/postre|dulce/.test(value)) return '🍰'
  if (/bebida|refresco|café|cafe/.test(value)) return '🥤'
  if (/sushi|roll/.test(value)) return '🍣'
  if (/pollo|alita|parrilla|carne/.test(value)) return '🍗'
  if (/helado/.test(value)) return '🍨'
  if (/chifa|arroz|chaufa/.test(value)) return '🍜'
  if (/ceviche|marisco|pescado/.test(value)) return '🐟'
  return '🍽️'
}

export default function RestaurantShowcase({ restaurantes, categorias, envios, categoriaActiva, restauranteActivoId, onCambiarCategoria, onCambiarRestaurante, preferencias, onOpenOrder }: Props) {
  const [platoIndex, setPlatoIndex] = useState(0)
  const [mostrarCarta, setMostrarCarta] = useState(false)
  const [subcategoria, setSubcategoria] = useState<string | null>(null)
  const [platoConfigurando, setPlatoConfigurando] = useState<PlatoHome | null>(null)
  const { favoritos, calificaciones, pendientes, toggleFavorito, calificar, clave } = preferencias
  const agregar = useCarrito((state) => state.agregar)
  const { toast } = useToast()

  const restaurantesCategoria = useMemo(
    () => restaurantes.filter((restaurante) => !categoriaActiva || restaurante.categorias.some((cat) => cat.slug === categoriaActiva)),
    [categoriaActiva, restaurantes],
  )
  const restaurante = restaurantesCategoria.find((item) => item.id === restauranteActivoId) || restaurantesCategoria[0]
  const platos = restaurante?.platos || []
  const destacados = platos.slice(0, 3)
  const plato = destacados[platoIndex] || destacados[0]
  const categoriasMenu = useMemo(() => {
    const values = new Map<string, string>()
    platos.forEach((item) => { if (item.subcategoria_id && item.subcategoria_nombre) values.set(item.subcategoria_id, item.subcategoria_nombre) })
    return [...values.entries()].map(([id, nombre]) => ({ id, nombre, emoji: emojiSubcategoria(nombre) }))
  }, [platos])
  const platosFiltrados = subcategoria ? platos.filter((item) => item.subcategoria_id === subcategoria) : platos
  const keyRestaurante = restaurante ? clave('restaurante', restaurante.id) : ''
  const keyPlato = plato ? clave('plato', plato.id) : ''
  const envio = restaurante ? envios[restaurante.id] : null

  useEffect(() => {
    setPlatoIndex(0)
    setMostrarCarta(false)
    setSubcategoria(null)
  }, [restaurante?.id])

  function cambiarCategoria(slug: string | null) {
    onCambiarCategoria(slug)
    const candidate = restaurantes.find((item) => !slug || item.categorias.some((cat) => cat.slug === slug))
    if (candidate) onCambiarRestaurante(candidate.id)
    setPlatoIndex(0)
    setMostrarCarta(false)
  }

  function seleccionarRestaurante(id: string) {
    onCambiarRestaurante(id)
    setPlatoIndex(0)
    setMostrarCarta(false)
    setSubcategoria(null)
  }

  function seleccionarCategoriaDeMenu(id: string | null) {
    setSubcategoria(id)
  }

  function agregarPlato(item: PlatoHome) {
    if (!restaurante) return
    if (!restaurante.abierto) {
      toast(`${restaurante.nombre} está cerrado por ahora`, { icon: '🔒' })
      return
    }
    if (!item.disponible) return
    if (item.grupos.length) {
      setPlatoConfigurando(item)
      return
    }
    agregar({
      plato_id: item.id,
      plato_nombre: item.nombre,
      plato_imagen: item.imagen_url,
      restaurante_id: restaurante.id,
      restaurante_slug: restaurante.slug,
      restaurante_nombre: restaurante.nombre,
      precio_unitario: Number(item.precio),
      cantidad: 1,
      notas: null,
      opciones: [],
    })
    toast(`${item.nombre} agregado`, { icon: '🛒' })
  }

  function abrirCarta() {
    setSubcategoria(null)
    setMostrarCarta(true)
  }

  return <section id="locales" aria-label="Restaurantes destacados" className="mx-auto w-full max-w-[1100px] px-4 pt-4 md:pt-6">
    <nav aria-label="Categorías de comida" role="tablist" className="mm-home-category-nav motomoto-display mb-3 flex snap-x gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] sm:justify-center">
      {categorias.map((categoria) => <button key={categoria.slug} type="button" role="tab" aria-selected={categoriaActiva === categoria.slug} onClick={() => cambiarCategoria(categoria.slug)} className={`shrink-0 snap-start rounded-full border px-5 py-2.5 text-sm font-black text-white shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 ${categoriaActiva === categoria.slug ? 'border-[#5877ff] bg-[#2949df] shadow-[#2949df]/30' : 'border-white/10 bg-black/65 hover:border-white/30'}`}><span className="mr-1.5 text-base" aria-hidden="true">{categoria.emoji || '🍽️'}</span>{categoria.nombre}</button>)}
      {categorias.length === 0 && <button type="button" onClick={() => cambiarCategoria(null)} className="rounded-full bg-[#2949df] px-4 py-2 text-xs font-black text-white">🍽️ Todos</button>}
    </nav>

    {restaurante ? <article className={`mm-home-showcase motomoto-display relative isolate grid min-h-[510px] overflow-hidden rounded-[30px] border border-white/15 shadow-[0_30px_75px_rgba(0,0,0,.5)] md:grid-cols-[.92fr_1.08fr] ${mostrarCarta ? 'mm-home-menu-open' : ''}`}>
      <div className="relative isolate flex min-h-[300px] flex-col items-center justify-center overflow-hidden bg-[#05060d] px-6 pb-7 pt-28 text-white sm:min-h-[400px] md:min-h-[510px] md:pt-28">
        {restaurante.banner_url && <img src={restaurante.banner_url} alt="" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25 blur-[1px]" />}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_55%,rgba(56,80,220,.4),transparent_62%)]" />
        <div className="mm-home-sign absolute left-[22px] top-0 z-10 w-[calc(100%-44px)] max-w-[450px] origin-top">
          <div className="mm-home-sign-chains" aria-hidden="true"><i /><i /></div>
          <div className="mm-home-sign-board relative flex items-center gap-[18px] px-5 py-5 sm:px-6">
            <div className="mm-home-sign-logo grid aspect-square shrink-0 place-items-center overflow-hidden rounded-full border-[3px] border-[#d9b65f] bg-gradient-to-br from-orange-500 to-[#315a38] text-3xl shadow-[0_0_0_3px_rgba(217,182,95,.12),0_5px_16px_rgba(0,0,0,.55)]">{restaurante.logo_url ? <img src={restaurante.logo_url} alt="" className="h-full w-full object-contain" /> : <span>{restaurante.categorias[0]?.emoji || '🍽️'}</span>}</div>
            <div className="min-w-0 flex-1"><span className="mm-home-sign-tag motomoto-display block text-[10px] font-black uppercase tracking-[.2em] text-[#dbb65e] sm:text-xs">{restaurante.subtitulo || restaurante.categorias[0]?.nombre || 'RECOMENDADO'}</span><h2 className="mm-home-sign-title motomoto-display line-clamp-2 font-black italic text-white">{restaurante.nombre}</h2></div>
          </div>
        </div>

        <p className="mm-home-vertical-info absolute left-2 top-1/2 hidden -translate-y-1/2 rotate-180 text-[9px] font-black tracking-wide text-white/65 [writing-mode:vertical-rl] sm:block">★ {Number(restaurante.calificacion || 0).toFixed(1)} · {restaurante.tiempo_estimado || 'Tiempo por confirmar'} · {envio?.costo != null && envio.permitido ? formatoSoles(envio.costo) : 'Delivery'} · {restaurante.direccion_fisica || 'Pucallpa'}</p>

        <div key={plato?.id || restaurante.id} className="mm-home-dish relative mt-6 grid h-[220px] w-full max-w-[420px] place-items-center sm:h-[290px] md:h-[315px]">
          <span className="absolute inset-x-10 bottom-1 h-10 rounded-[50%] bg-black/80 blur-2xl" />
          {plato?.imagen_url ? <img src={plato.imagen_url} alt={plato.nombre} className="relative h-full w-full object-contain drop-shadow-[0_28px_22px_rgba(0,0,0,.75)]" /> : <span className="relative grid h-full w-full place-items-center text-[clamp(8rem,25vw,15rem)] leading-none drop-shadow-[0_24px_22px_rgba(0,0,0,.7)]">{restaurante.categorias[0]?.emoji || '🍽️'}</span>}
        </div>
        <div className="mt-3 flex w-full max-w-[420px] items-center justify-between gap-2 text-xs font-bold text-white/65 sm:text-sm"><span>★ {Number(restaurante.calificacion || 0).toFixed(1)} · {restaurante.num_resenas} reseñas</span><span>⏱ {plato?.tiempo_estimado ? `${plato.tiempo_estimado} min` : restaurante.tiempo_estimado || '—'}</span></div>
        {destacados.length > 1 && <button type="button" onClick={() => setPlatoIndex((index) => (index + 1) % destacados.length)} aria-label="Ver el siguiente plato" className="mm-home-next-dish absolute bottom-6 left-6 grid place-items-center rounded-full border-[3px] border-white bg-[radial-gradient(circle,#1c2150,#05060d)] text-3xl shadow-[0_10px_24px_rgba(0,0,0,.6)] transition hover:-translate-y-1 hover:rotate-[-8deg]">{destacados[(platoIndex + 1) % destacados.length]?.imagen_url ? <img src={destacados[(platoIndex + 1) % destacados.length].imagen_url!} alt="" className="h-full w-full object-contain p-2" /> : <span>{restaurante.categorias[0]?.emoji || '🍽️'}</span>}</button>}
      </div>

      <div className="flex min-w-0 flex-col bg-gradient-to-br from-[#fbfbff] via-[#f0f1fb] to-[#ffeadb] p-5 text-[#0b0d1a] sm:p-7">
        <div className="flex min-h-10 items-center gap-2">
          <div role="tablist" aria-label="Locales de esta categoría" className="flex min-w-0 flex-1 snap-x gap-4 overflow-x-auto [scrollbar-width:none]">
            {restaurantesCategoria.map((item) => <button key={item.id} type="button" role="tab" aria-selected={item.id === restaurante.id} onClick={() => seleccionarRestaurante(item.id)} className={`relative shrink-0 snap-start px-1 pb-2 text-[14px] font-black italic transition sm:text-base ${item.id === restaurante.id ? 'text-[#10121c] after:absolute after:bottom-0 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-[#ff7628]' : 'text-[#55596c]/65 hover:text-[#242634]'}`}>{item.nombre}</button>)}
          </div>
          <button type="button" onClick={onOpenOrder} aria-label="Mi pedido" title="Mi pedido" className="motomoto-display flex shrink-0 items-center gap-2 rounded-full bg-[#2949df] px-4 py-3 text-sm font-black italic text-white shadow-[0_8px_20px_rgba(41,73,223,.35)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(41,73,223,.5)] active:scale-95 sm:px-5 sm:text-base">🛒 Mi pedido</button>
        </div>

        {plato ? <>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-black text-[#45485c] sm:text-xs">
            <span className={`rounded-full px-2.5 py-1 ${restaurante.abierto ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}`}>{restaurante.abierto ? '● Abierto' : '● Cerrado'}</span>
            {restaurante.tiempo_estimado && <span className="rounded-full bg-white/75 px-2.5 py-1">⏱ {restaurante.tiempo_estimado}</span>}
            {envio?.permitido && envio.costo != null && <span className="rounded-full bg-white/75 px-2.5 py-1">🛵 {formatoSoles(envio.costo)}</span>}
            {restaurante.categorias[0] && <span className="rounded-full bg-white/75 px-2.5 py-1">{restaurante.categorias[0].emoji || '🍽️'} {restaurante.categorias[0].nombre}</span>}
          </div>
          <div className="mm-home-title-row mt-4 flex items-start gap-3">
            <h1 key={`name-${plato.id}`} className="mm-home-title motomoto-display min-w-0 flex-1 line-clamp-2 text-4xl font-black italic leading-[.98] tracking-tight text-[#0b0d1a] sm:text-5xl xl:text-6xl">{plato.nombre}</h1>
            <FavoritoButton compact active={favoritos.has(keyPlato)} pending={pendientes.has(keyPlato)} onClick={(source) => void toggleFavorito('plato', plato.id, source).catch((error) => window.alert(error instanceof Error ? error.message : 'No se pudo actualizar el favorito.'))} />
          </div>
          <div className="mm-home-product-details mt-3">
            <p key={`description-${plato.id}`} className="mm-home-description line-clamp-4 text-sm font-semibold italic leading-relaxed text-[#34374d] sm:text-base">{plato.descripcion || restaurante.subtitulo || `Disfruta lo mejor de ${restaurante.nombre}.`}</p>
            <div className="mm-home-buy-panel">
              <div className="mm-home-price-time"><div><small className="block text-[11px] font-bold italic text-[#64687b]">Precio</small><strong className="motomoto-display text-3xl font-black italic text-[#e0301e] sm:text-4xl">{formatoSoles(plato.precio)}</strong></div>{plato.tiempo_estimado && <span className="mb-1 text-xs font-black italic text-[#25283a] sm:text-sm">◷ {plato.tiempo_estimado} min</span>}</div>
              <button type="button" onClick={() => agregarPlato(plato)} disabled={!restaurante.abierto || !plato.disponible} className="motomoto-display inline-flex h-12 w-full items-center justify-between gap-2 rounded-2xl bg-[#05060d] pl-4 pr-2 text-sm font-black italic text-white shadow-[0_10px_20px_rgba(0,0,0,.27)] transition hover:-translate-y-0.5 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:pl-5 sm:text-base"><span className="min-w-0 truncate">{restaurante.abierto ? plato.disponible ? 'Agregar al carrito' : 'No disponible' : 'Local cerrado'}</span><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-xl not-italic text-black">+</span></button>
              <div className="mm-home-rating-row"><CalificacionEstrellas compact rating={calificaciones[keyPlato]} pending={pendientes.has(keyPlato)} onRate={(stars) => void calificar('plato', plato.id, stars).catch((error) => window.alert(error instanceof Error ? error.message : 'No se pudo guardar tu calificación.'))} /></div>
            </div>
          </div>
          <button type="button" aria-label="Ver todos los productos" onClick={abrirCarta} className="motomoto-display mt-3 inline-flex h-[54px] w-full max-w-[390px] items-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff9142] via-[#ff5a1f] to-[#e0301e] px-5 text-left text-sm font-black italic text-white shadow-[0_12px_24px_rgba(255,90,30,.38)] transition hover:-translate-y-0.5 sm:h-[58px] sm:px-6 sm:text-base"><span className="flex-1">Ver todos los productos</span><span className="grid h-8 w-8 place-items-center rounded-full bg-black/25">{platos.length}</span><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-xl text-[#e0301e]">→</span></button>
        </> : <div className="flex flex-1 flex-col justify-center"><h1 className="motomoto-display text-4xl font-black italic">{restaurante.nombre}</h1><p className="mt-3 text-sm text-black/65">Este restaurante aún no tiene productos en su carta.</p></div>}

        {destacados.length > 0 && <div className="mt-auto grid grid-cols-3 gap-2.5 pt-8 sm:gap-3 sm:pt-9">{destacados.map((item, index) => <button key={item.id} type="button" onClick={() => setPlatoIndex(index)} aria-pressed={plato?.id === item.id} className={`mm-home-product-card relative flex min-h-[88px] flex-col items-center justify-end rounded-[20px] bg-[#05060d] px-2 pb-3 pt-8 text-center text-white shadow-[0_12px_24px_rgba(0,0,0,.25)] transition hover:-translate-y-1 sm:min-h-[104px] sm:pb-3.5 ${plato?.id === item.id ? 'ring-[3px] ring-[#ff7628]' : ''}`}><span className="absolute -top-6 grid h-14 w-14 place-items-center sm:-top-7 sm:h-16 sm:w-16">{item.imagen_url ? <img src={item.imagen_url} alt="" className="h-full w-full object-contain drop-shadow-lg" /> : <span className="text-3xl">{restaurante.categorias[0]?.emoji || '🍽️'}</span>}</span><span className="absolute right-2 top-2 text-[10px] font-black text-[#ff765f] sm:text-xs">{formatoSoles(item.precio)}</span><span className="line-clamp-2 text-[11px] font-black italic leading-tight sm:text-xs">{item.nombre}</span></button>)}</div>}
        {destacados.length > 1 && <div className="flex justify-center gap-1.5 pt-3">{destacados.map((item, index) => <button key={item.id} type="button" onClick={() => setPlatoIndex(index)} aria-label={`Mostrar ${item.nombre}`} aria-pressed={plato?.id === item.id} className={`h-1.5 rounded-full transition-all ${plato?.id === item.id ? 'w-5 bg-[#e0301e]' : 'w-1.5 bg-[#bfc2d6] hover:bg-[#747991]'}`} />)}</div>}
      </div>

      {mostrarCarta && <div className="absolute inset-0 z-20 flex min-h-0 flex-col overflow-hidden rounded-[inherit] border border-white/15 bg-[#08090d]/95 p-4 text-white shadow-2xl backdrop-blur-2xl sm:p-6">
        <header className="flex shrink-0 items-center gap-3 border-b border-white/10 pb-4"><button type="button" onClick={() => setMostrarCarta(false)} aria-label="Volver al plato destacado" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-2xl transition hover:bg-white/20">‹</button><div className="min-w-0 flex-1"><p className="motomoto-display text-[9px] font-black uppercase tracking-[.16em] text-orange-300">Carta completa</p><h2 className="motomoto-display truncate text-lg font-black italic sm:text-2xl">{restaurante.nombre}</h2></div><button type="button" onClick={onOpenOrder} aria-label="Mi pedido" title="Mi pedido" className="motomoto-display shrink-0 rounded-full bg-[#2949df] px-3 py-2 text-[9px] font-black italic transition hover:-translate-y-0.5 active:scale-95 sm:px-4 sm:text-xs">🛒 Mi pedido</button></header>
        {categoriasMenu.length > 0 && <nav aria-label="Filtrar productos por subcategoría" className="flex shrink-0 gap-2 overflow-x-auto py-3 [scrollbar-width:none]"><button type="button" onClick={() => seleccionarCategoriaDeMenu(null)} aria-pressed={!subcategoria} className={`motomoto-display shrink-0 rounded-full px-3 py-2 text-[10px] font-black italic ${!subcategoria ? 'bg-[#2949df] text-white' : 'border border-white/15 bg-white/5 text-white/70'}`}>🍽️ Todos</button>{categoriasMenu.map((cat) => <button key={cat.id} type="button" onClick={() => seleccionarCategoriaDeMenu(cat.id)} aria-pressed={subcategoria === cat.id} className={`motomoto-display shrink-0 rounded-full px-3 py-2 text-[10px] font-black italic ${subcategoria === cat.id ? 'bg-[#2949df] text-white' : 'border border-white/15 bg-white/5 text-white/70'}`}>{cat.nombre}</button>)}</nav>}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{platosFiltrados.map((item) => { const itemKey = clave('plato', item.id); return <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.055] p-3 shadow-lg"><div className="flex gap-3"><div className="grid aspect-square h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-black/40">{item.imagen_url ? <img src={item.imagen_url} alt={item.nombre} className="h-full w-full object-contain" /> : <span className="text-3xl">{restaurante.categorias[0]?.emoji || '🍽️'}</span>}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="motomoto-display line-clamp-2 text-sm font-black italic">{item.nombre}</h3><FavoritoButton compact active={favoritos.has(itemKey)} pending={pendientes.has(itemKey)} onClick={(source) => void toggleFavorito('plato', item.id, source).catch((error) => window.alert(error instanceof Error ? error.message : 'No se pudo actualizar el favorito.'))} /></div><p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-white/55">{item.descripcion || 'Preparado al momento.'}</p><strong className="mt-2 block text-sm font-black text-[#ff765f]">{formatoSoles(item.precio)}</strong></div></div><div className="mt-2 flex items-center justify-between gap-2"><CalificacionEstrellas compact rating={calificaciones[itemKey]} pending={pendientes.has(itemKey)} onRate={(stars) => void calificar('plato', item.id, stars).catch((error) => window.alert(error instanceof Error ? error.message : 'No se pudo guardar tu calificación.'))} /><button type="button" onClick={() => agregarPlato(item)} disabled={!restaurante.abierto || !item.disponible} className="rounded-full bg-[#ff7628] px-3 py-2 text-[10px] font-black text-white transition hover:bg-[#e85b1c] disabled:opacity-40">{!restaurante.abierto ? 'Cerrado' : item.disponible ? '+ Agregar' : 'Agotado'}</button></div></article>})}</div>{platosFiltrados.length === 0 && <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/55">No hay productos en esta categoría.</p>}</div>
      </div>}
      {mostrarCarta && restaurante && <RestaurantMenuOverlay
        restaurante={restaurante}
        open={mostrarCarta}
        onClose={() => setMostrarCarta(false)}
        categorias={categoriasMenu}
        subcategoria={subcategoria}
        onSelectCategory={seleccionarCategoriaDeMenu}
        platos={platosFiltrados}
        favoritos={favoritos}
        calificaciones={calificaciones}
        pendientes={pendientes}
        toggleFavorito={toggleFavorito}
        calificar={calificar}
        clave={clave}
        onAgregar={agregarPlato}
        onOpenOrder={onOpenOrder}
      />}
    </article> : <div className="rounded-[28px] border border-white/10 bg-black/60 p-12 text-center text-white/70">Aún no hay restaurantes para mostrar.</div>}

    {restaurante && platoConfigurando && <OpcionesModal open onClose={() => setPlatoConfigurando(null)} plato={platoConfigurando} grupos={platoConfigurando.grupos} restaurante={{ id: restaurante.id, slug: restaurante.slug, nombre: restaurante.nombre }} />}
  </section>
}
