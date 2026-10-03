'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCarrito } from '@/lib/carrito/store'
import { useDireccionActual, type DireccionLocal } from '@/hooks/use-direccion-actual'
import type { RestauranteHome } from '@/components/home/home-restaurantes'
import { ABRIR_DIRECCION_EVENT } from '@/lib/direccion-events'
import { useEnviosMultiples } from '@/hooks/use-envio'

interface Props {
  open: boolean
  onClose: () => void
  estaLogueado: boolean
  direccionDeBD: DireccionLocal | null
  restaurantes: RestauranteHome[]
  costoVip: number
}

const soles = (valor: number) => `S/ ${valor.toFixed(2)}`
const centro: [number, number] = [-8.3791, -74.5539]

export default function PedidoModal({ open, onClose, estaLogueado, direccionDeBD, restaurantes, costoVip }: Props) {
  const router = useRouter()
  const mapaElement = useRef<HTMLDivElement>(null)
  const mapaRef = useRef<any>(null)
  const capaRef = useRef<any>(null)
  const [mapaListo, setMapaListo] = useState(false)
  const items = useCarrito((state) => state.items)
  const cambiarCantidad = useCarrito((state) => state.cambiarCantidad)
  const vaciar = useCarrito((state) => state.vaciar)
  const direccion = useDireccionActual(direccionDeBD)
  const [propina, setPropina] = useState(0)
  const [vip, setVip] = useState(false)
  const [notas, setNotas] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [codigo, setCodigo] = useState('')
  const [fecha, setFecha] = useState('')

  const grupos = useMemo(() => {
    const agrupados = new Map<string, typeof items>()
    items.forEach((item) => agrupados.set(item.restaurante_id, [...(agrupados.get(item.restaurante_id) || []), item]))
    return [...agrupados.entries()].map(([id, platos]) => ({ id, nombre: platos[0]?.restaurante_nombre || 'Restaurante', platos }))
  }, [items])
  const ids = useMemo(() => grupos.map((grupo) => grupo.id), [grupos])
  const lat = direccion?.lat != null && Number.isFinite(Number(direccion.lat)) ? Number(direccion.lat) : null
  const lng = direccion?.lng != null && Number.isFinite(Number(direccion.lng)) ? Number(direccion.lng) : null
  const { envios, loading } = useEnviosMultiples(ids, lat, lng)
  const subtotal = items.reduce((total, item) => total + item.precio_unitario * item.cantidad, 0)
  const envio = grupos.reduce((total, grupo) => total + (envios[grupo.id]?.costo || 0), 0)
  const total = subtotal + envio + propina + (vip ? costoVip : 0)
  const numero = codigo || '······'

  useEffect(() => {
    if (!open) return
    if (!codigo) setCodigo(String(Math.floor(100000 + Math.random() * 900000)))
    setFecha(new Date().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }))
  }, [open, codigo])

  useEffect(() => {
    if (!open) return
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const keydown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !enviando) onClose() }
    window.addEventListener('keydown', keydown)
    return () => { document.body.style.overflow = previo; window.removeEventListener('keydown', keydown) }
  }, [open, onClose, enviando])

  useEffect(() => {
    if (!open || !mapaElement.current) return
    setMapaListo(false)
    let cancelado = false
    let instancia: any
    import('leaflet').then((L) => {
      if (cancelado || !mapaElement.current || mapaRef.current) return
      instancia = L.map(mapaElement.current, { zoomControl: true, scrollWheelZoom: false }).setView(centro, 13)
      mapaRef.current = instancia
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(instancia)
      capaRef.current = L.layerGroup().addTo(instancia)
      setMapaListo(true)
      requestAnimationFrame(() => instancia?.invalidateSize({ pan: false }))
    }).catch(() => setError('No se pudo cargar el mapa. Puedes continuar con tu dirección guardada.'))
    return () => {
      cancelado = true
      mapaRef.current?.remove()
      mapaRef.current = null
      capaRef.current = null
    }
  }, [open])

  useEffect(() => {
    if (!open || !mapaListo || !mapaRef.current || !capaRef.current) return
    import('leaflet').then((L) => {
      if (!open || !mapaRef.current || !capaRef.current) return
      const layer = capaRef.current
      layer.clearLayers()
      const puntos: [number, number][] = []
      grupos.forEach((grupo, index) => {
        const restaurante = restaurantes.find((item) => item.id === grupo.id)
        const rLat = Number(restaurante?.lat)
        const rLng = Number(restaurante?.lng)
        if (restaurante?.lat == null || restaurante?.lng == null || !Number.isFinite(rLat) || !Number.isFinite(rLng)) return
        const point: [number, number] = [rLat, rLng]
        puntos.push(point)
        L.marker(point, { title: grupo.nombre, icon: L.divIcon({ className: '', html: `<span class="mm-order-map-pin">${index + 1}</span>`, iconSize: [34, 40], iconAnchor: [17, 37] }) }).addTo(layer)
        if (lat != null && lng != null) L.polyline([point, [lat, lng]], { color: '#ff7628', weight: 3, dashArray: '6 8', opacity: .85 }).addTo(layer)
      })
      if (lat != null && lng != null) {
        const customer: [number, number] = [lat, lng]
        puntos.push(customer)
        L.marker(customer, { title: 'Entrega', icon: L.divIcon({ className: '', html: '<span class="mm-order-map-home">⌂</span>', iconSize: [38, 42], iconAnchor: [19, 38] }) }).addTo(layer)
      }
      if (puntos.length > 1) mapaRef.current.fitBounds(L.latLngBounds(puntos).pad(.2), { maxZoom: 15, animate: false })
      else if (puntos.length) mapaRef.current.setView(puntos[0], 15, { animate: false })
      else mapaRef.current.setView(centro, 13, { animate: false })
      requestAnimationFrame(() => mapaRef.current?.invalidateSize({ pan: false }))
    })
  }, [open, mapaListo, grupos, restaurantes, lat, lng])

  if (!open) return null

  async function pedir() {
    setError('')
    if (!items.length) return setError('Agrega al menos un plato a tu pedido.')
    if (!estaLogueado) { router.push('/login?redirect=/'); return }
    if (!direccion?.id) {
      setError('Selecciona o guarda una dirección de entrega para calcular el envío.')
      window.dispatchEvent(new Event(ABRIR_DIRECCION_EVENT))
      return
    }
    if (lat == null || lng == null) return setError('La dirección guardada necesita coordenadas. Selecciona una ubicación en el mapa.')
    if (loading || grupos.some((grupo) => !envios[grupo.id])) return setError('Espera a que termine el cálculo de envío.')
    const noPermitidos = grupos.find((grupo) => !envios[grupo.id]?.permitido)
    if (noPermitidos) return setError(envios[noPermitidos.id]?.razon === 'SUPERA_DISTANCIA_MAXIMA' ? `${noPermitidos.nombre} está fuera de la cobertura de entrega.` : `No hay una ruta de envío disponible para ${noPermitidos.nombre}.`)

    setEnviando(true)
    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          direccion_id: direccion.id,
          propina,
          vip,
          notas: notas.trim() || null,
          grupos: grupos.map((grupo) => ({
            restaurante_id: grupo.id,
            items: grupo.platos.map((item) => ({
              plato_id: item.plato_id,
              cantidad: item.cantidad,
              notas: item.notas,
              opciones: item.opciones.map((opcion) => ({ grupo_id: opcion.grupo_id, choice_id: opcion.choice_id, grupo_titulo: opcion.grupo_titulo, choice_nombre: opcion.choice_nombre })),
            })),
          })),
        }),
      })
      const result = await response.json()
      if (!response.ok || !result.ok) throw new Error(result.error || 'No se pudo crear el pedido.')
      vaciar()
      onClose()
      router.push(`/pedido/${result.data.codigo}`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error de conexión al crear el pedido.')
    } finally { setEnviando(false) }
  }

  return (
    <div className="mm-order-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !enviando && onClose()}>
      <section className="mm-order-layout" role="dialog" aria-modal="true" aria-labelledby="mm-order-title">
        <div className="mm-order-machine">
          <div className="mm-order-slot"><i /><button type="button" onClick={onClose} aria-label="Cerrar pedido" disabled={enviando}>×</button></div>
          <div className="mm-order-feed"><div className="mm-order-paper">
            <div className="mm-order-brand">Moto<span>Moto</span></div>
            <p className="mm-order-date">{fecha}</p>
            <h2 id="mm-order-title">BOLETA DE PEDIDO</h2>
            <p className="mm-order-date">N° {numero}</p>
            <hr />
            {grupos.length ? grupos.map((grupo, index) => <div className="mm-order-group" key={grupo.id}>
              <h3><span>{restaurantes.find((item) => item.id === grupo.id)?.categorias[0]?.emoji || '🏪'}</span>{grupo.nombre}</h3>
              {grupo.platos.map((item) => <div className="mm-order-item" key={item.id}>
                <div className="mm-order-quantity"><button type="button" aria-label={`Quitar uno de ${item.plato_nombre}`} onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}>−</button><b>{item.cantidad}</b><button type="button" aria-label={`Agregar uno de ${item.plato_nombre}`} onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}>+</button></div>
                <span className="mm-order-item-name">{item.plato_nombre}{item.opciones.length > 0 && <small>{item.opciones.map((opcion) => opcion.choice_nombre).join(' · ')}</small>}</span>
                <strong>{soles(item.precio_unitario * item.cantidad)}</strong>
              </div>)}
              <small className="mm-order-delivery-label">Delivery · {envios[grupo.id]?.distancia_km != null ? `${envios[grupo.id].distancia_km.toFixed(1)} km` : 'calculando'}</small>
            </div>) : <div className="mm-order-empty"><span>🧾</span><b>Tu boleta está vacía</b><small>Agrega platos y aparecerán aquí.</small></div>}
            <hr />
            <details className="mm-order-tip"><summary>💰 ¿Agregar propina para el repartidor?</summary><div>{[0, 1, 2, 3].map((value) => <button key={value} type="button" aria-pressed={propina === value} onClick={() => setPropina(value)}>{value ? `S/ ${value}` : 'No'}</button>)}</div></details>
            <button type="button" className={`mm-order-vip ${vip ? 'is-on' : ''}`} role="switch" aria-checked={vip} onClick={() => setVip((value) => !value)}><span>👑</span><span><b>Servicio VIP</b><small>Prioridad en tu pedido</small></span><strong>+{soles(costoVip)}</strong><i>{vip ? '✓' : ''}</i></button>
            <label className="mm-order-note"><span>📝 Nota para tu pedido (opcional)</span><textarea value={notas} onChange={(event) => setNotas(event.target.value.slice(0, 500))} placeholder="Tocar timbre, sin cebolla…" rows={2} /></label>
            <div className="mm-order-totals"><p><span>Subtotal</span><b>{soles(subtotal)}</b></p><p><span>Envío ({grupos.length} locales)</span><b>{loading ? 'Calculando…' : soles(envio)}</b></p>{propina > 0 && <p><span>Propina</span><b>{soles(propina)}</b></p>}{vip && <p><span>Servicio VIP</span><b>{soles(costoVip)}</b></p>}<p className="is-total"><span>TOTAL</span><b>{soles(total)}</b></p></div>
            <div className="mm-order-thanks">¡GRACIAS!</div><div className="mm-order-barcode" aria-hidden="true">▏▌▏▏▌▌▏▌▏▏▏▌▌▏▏▌▏▌▌▏▏▌▌▏▏▏▌▌▏▌▏▌▌▏▏▌▏▏▌▌▏▌▏▏▏▌▌▏</div><small className="mm-order-code">{numero}</small>
          </div></div>
          <div className="mm-order-actions">
            {error && <p role="alert" className="mm-order-error">{error}</p>}
            <button type="button" className="mm-order-submit" onClick={() => void pedir()} disabled={enviando || !items.length}><span>▢　{enviando ? 'Procesando pedido…' : 'Pedir'}</span><b>{soles(total)}</b></button>
            <div className="mm-order-secondary"><button type="button" onClick={onClose}>Seguir pidiendo</button><button type="button" onClick={vaciar} disabled={!items.length || enviando}>Vaciar</button></div>
          </div>
        </div>

        <aside className="mm-order-side" aria-label="Ubicaciones del pedido">
          <div className="mm-order-map"><div ref={mapaElement} /><span>Mapa de locales y entrega</span></div>
          {grupos.map((grupo, index) => <article className="mm-order-place" key={grupo.id}><i>{index + 1}</i><span><small>Punto del local</small><b>{grupo.nombre}</b><em>{restaurantes.find((item) => item.id === grupo.id)?.direccion_fisica || 'Pucallpa'}</em></span></article>)}
          <article className="mm-order-place is-customer"><i>{grupos.length + 1}</i><span><small>Ubicación del cliente</small><b>{direccion?.etiqueta || 'Aún sin dirección'}</b><em>{direccion ? `${direccion.direccion}${direccion.referencia ? ` · Ref: ${direccion.referencia}` : ''}` : 'Marca dónde te entregamos'}</em></span><button type="button" onClick={() => window.dispatchEvent(new Event(ABRIR_DIRECCION_EVENT))}>{direccion ? 'Cambiar' : 'Marcar'}</button></article>
        </aside>
      </section>
    </div>
  )
}
