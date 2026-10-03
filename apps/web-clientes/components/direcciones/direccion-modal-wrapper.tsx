'use client'

import { useRouter } from 'next/navigation'
import MapaLocalesModal, { type PuntoEntregaMapa } from '@/components/mapa/mapa-locales-modal'
import { guardarDireccionTemporal, limpiarDireccionTemporal } from '@/hooks/use-direccion-actual'
import type { Direccion } from './direccion-modal'

interface Props {
  open: boolean
  onClose: () => void
  estaLogueado: boolean
  initialData?: Partial<Direccion>
  onGuardada?: () => void | Promise<void>
  predeterminadaAlGuardar?: boolean
}

export default function DireccionModalWrapper({
  open,
  onClose,
  estaLogueado,
  initialData,
  onGuardada,
  predeterminadaAlGuardar = false,
}: Props) {
  const router = useRouter()

  async function guardar(direccion: PuntoEntregaMapa) {
    const id = direccion.id || initialData?.id
    const esPredeterminada = predeterminadaAlGuardar || Boolean(initialData?.es_predeterminada)

    if (estaLogueado) {
      const response = await fetch(id ? `/api/direcciones/${id}` : '/api/direcciones', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etiqueta: direccion.etiqueta,
          direccion: direccion.direccion,
          referencia: direccion.referencia,
          lat: direccion.lat,
          lng: direccion.lng,
          es_predeterminada: esPredeterminada,
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

    await onGuardada?.()
    router.refresh()
  }

  return (
    <MapaLocalesModal
      open={open}
      onClose={onClose}
      onConfirmarUbicacion={guardar}
      direccionActual={initialData as Partial<PuntoEntregaMapa> | undefined}
      modoEdicion={!!initialData?.id}
    />
  )
}
