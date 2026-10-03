-- Solicitudes de recuperación de contraseña para web-clientes y web-admin.
-- Ejecutar una sola vez en la base Neon de MotoMoto.

CREATE TABLE IF NOT EXISTS solicitudes_recuperacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  celular VARCHAR(9) NOT NULL,
  usuario_id UUID REFERENCES usuarios(id),
  estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
    CHECK (estado IN ('PENDIENTE', 'ATENDIDA', 'CANCELADA')),
  notas TEXT,
  atendido_por UUID REFERENCES usuarios(id),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atendido_en TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_celular
  ON solicitudes_recuperacion (celular);

CREATE INDEX IF NOT EXISTS idx_solicitudes_estado
  ON solicitudes_recuperacion (estado, creado_en DESC);
