-- Caché de rutas por calles usada por el cálculo automático del delivery.
-- Ejecutar en Neon en la misma base de datos del web de clientes.

CREATE TABLE IF NOT EXISTS rutas_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_lat NUMERIC(9,6) NOT NULL,
  restaurante_lng NUMERIC(9,6) NOT NULL,
  cliente_lat NUMERIC(9,6) NOT NULL,
  cliente_lng NUMERIC(9,6) NOT NULL,
  distancia_km NUMERIC(6,2) NOT NULL,
  duracion_min INTEGER,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS rutas_cache_unique
  ON rutas_cache (restaurante_lat, restaurante_lng, cliente_lat, cliente_lng);
