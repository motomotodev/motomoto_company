-- Asocia los usuarios STAFF con su restaurante para inicio de sesión y administración local.

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS restaurante_id UUID REFERENCES restaurantes(id) ON DELETE SET NULL;