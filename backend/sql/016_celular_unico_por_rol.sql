-- Permite que un mismo teléfono pertenezca a un cliente y a un driver.
-- Mantiene la unicidad del celular dentro de cada rol.

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_celular_key;
DROP INDEX IF EXISTS usuarios_celular_key;

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_customer_celular_key
  ON usuarios (celular)
  WHERE role = 'CUSTOMER' AND celular IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_driver_celular_key
  ON usuarios (celular)
  WHERE role = 'DRIVER' AND celular IS NOT NULL;
