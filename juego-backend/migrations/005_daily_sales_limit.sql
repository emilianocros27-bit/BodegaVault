-- Límite diario de ventas por jugador
ALTER TABLE user_stats
  ADD COLUMN IF NOT EXISTS daily_sales      INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_sales_date DATE;
