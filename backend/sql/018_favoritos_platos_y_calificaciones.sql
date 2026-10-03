-- Favoritos de platos y calificaciones por cliente para restaurantes y platos.
-- Los favoritos de restaurantes ya usan la tabla `favoritos`.

CREATE TABLE IF NOT EXISTS favoritos_platos (
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  plato_id UUID NOT NULL REFERENCES platos(id) ON DELETE CASCADE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, plato_id)
);

CREATE INDEX IF NOT EXISTS idx_favoritos_platos_usuario
  ON favoritos_platos (usuario_id, creado_en DESC);

CREATE TABLE IF NOT EXISTS calificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  restaurante_id UUID REFERENCES restaurantes(id) ON DELETE CASCADE,
  plato_id UUID REFERENCES platos(id) ON DELETE CASCADE,
  estrellas SMALLINT NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT calificaciones_un_sujeto CHECK (
    (restaurante_id IS NOT NULL AND plato_id IS NULL)
    OR (restaurante_id IS NULL AND plato_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_calificaciones_usuario_restaurante
  ON calificaciones (usuario_id, restaurante_id)
  WHERE restaurante_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_calificaciones_usuario_plato
  ON calificaciones (usuario_id, plato_id)
  WHERE plato_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_calificaciones_restaurante
  ON calificaciones (restaurante_id) WHERE restaurante_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_calificaciones_plato
  ON calificaciones (plato_id) WHERE plato_id IS NOT NULL;
