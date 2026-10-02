-- Monto de la propina VIP asociada a cada sub-pedido.

ALTER TABLE sub_pedidos
  ADD COLUMN IF NOT EXISTS propina_vip_monto NUMERIC(8,2) DEFAULT 0;