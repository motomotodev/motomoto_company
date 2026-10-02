-- Catálogo de fondos en video para web de escritorio y móvil.
-- La selección se guarda por dispositivo para permitir cambiarla desde Admin.

CREATE TABLE IF NOT EXISTS videos_fondo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(8) NOT NULL CHECK (tipo IN ('WEB', 'MOVIL')),
  nombre VARCHAR(120) NOT NULL,
  url TEXT NOT NULL CHECK (url ~ '^https://'),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT videos_fondo_tipo_url_key UNIQUE (tipo, url)
);

CREATE INDEX IF NOT EXISTS idx_videos_fondo_tipo_creado
  ON videos_fondo (tipo, creado_en DESC);

CREATE TABLE IF NOT EXISTS videos_fondo_config (
  tipo VARCHAR(8) PRIMARY KEY CHECK (tipo IN ('WEB', 'MOVIL')),
  video_id UUID REFERENCES videos_fondo(id) ON DELETE SET NULL,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prepara las dos categorías sin asumir URLs de ejemplo. El primer video
-- agregado desde Admin se selecciona automáticamente para su categoría.
INSERT INTO videos_fondo_config (tipo)
VALUES ('MOVIL'), ('WEB')
ON CONFLICT (tipo) DO NOTHING;
