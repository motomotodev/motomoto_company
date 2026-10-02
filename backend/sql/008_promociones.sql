-- Crea la tabla usada por el carrusel de promociones en web-clientes y web-admin.
-- Seguro para ejecutar varias veces y compatible con bases ya inicializadas.

CREATE TABLE IF NOT EXISTS promociones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge VARCHAR(40),
  titulo VARCHAR(80) NOT NULL,
  subtitulo VARCHAR(120),
  descripcion TEXT,
  cta_texto VARCHAR(40),
  imagen_url TEXT,
  gradiente_css VARCHAR(160),
  link_url VARCHAR(255),
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE promociones
  ADD COLUMN IF NOT EXISTS link_url VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_promociones_activo
  ON promociones (activo, orden);