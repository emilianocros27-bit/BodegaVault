-- Borrar dependencias de NPC trades si existen
DROP TABLE IF EXISTS npc_trades CASCADE;

-- Tabla de intercambios entre jugadores
CREATE TABLE IF NOT EXISTS player_trades (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Objetos que el creador ofrece (array de item IDs)
  offer_items   UUID[] NOT NULL,
  -- Lo que el creador pide: puede ser un catalog_id específico, una rareza mínima, o nulo (abierto)
  want_catalog  TEXT,
  want_rarity   TEXT,
  want_note     TEXT,         -- texto libre opcional "quiero algo de música"
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','accepted','cancelled','expired')),
  respondent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  respond_items UUID[],       -- items que el respondedor propuso
  creator_accepted  BOOLEAN DEFAULT NULL,
  respondent_accepted BOOLEAN DEFAULT NULL,
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '72 hours',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_player_trades_creator  ON player_trades(creator_id, status);
CREATE INDEX IF NOT EXISTS idx_player_trades_open     ON player_trades(status, expires_at);
