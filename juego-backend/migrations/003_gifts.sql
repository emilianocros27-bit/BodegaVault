-- Tabla de regalos de bodegas
CREATE TABLE IF NOT EXISTS bodega_gifts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bodega_id    TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',  -- pending | opened
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gifts_recipient ON bodega_gifts(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_gifts_sender    ON bodega_gifts(sender_id, created_at);

-- Control de límite diario de regalos enviados
ALTER TABLE user_stats
  ADD COLUMN IF NOT EXISTS gifts_sent_today INT  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gifts_date       DATE;

-- Metadata en notificaciones (para marcar notifs de regalo con gift_id)
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS metadata JSONB;
