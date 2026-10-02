-- Configuración opcional del costo mínimo de envío por restaurante.
-- NULL conserva el cálculo habitual por distancia.

ALTER TABLE restaurantes
  ADD COLUMN IF NOT EXISTS costo_envio_minimo NUMERIC(6,2) DEFAULT NULL;