-- Links públicos de redes sociales administrables desde Configuración.
ALTER TABLE configuracion_sistema
  ADD COLUMN IF NOT EXISTS redes_sociales JSONB NOT NULL DEFAULT
    '{"instagram":null,"tiktok":null,"facebook":null,"whatsapp":null,"youtube":null,"telegram":null,"x":null}'::jsonb;
