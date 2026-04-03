-- ============================================================
-- BodegaVault — Migración inicial
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- búsqueda fuzzy

-- ── USUARIOS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username      VARCHAR(30)  NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar        VARCHAR(10)  DEFAULT '🧑',
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  DEFAULT NOW(),
  last_login    TIMESTAMPTZ,
  is_banned     BOOLEAN      DEFAULT FALSE
);

-- ── PROGRESO DEL JUGADOR ──────────────────────────────────
CREATE TABLE IF NOT EXISTS user_stats (
  user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  money           BIGINT  DEFAULT 500   CHECK (money >= 0),
  level           INTEGER DEFAULT 1     CHECK (level >= 1),
  xp              BIGINT  DEFAULT 0     CHECK (xp >= 0),
  xp_next         BIGINT  DEFAULT 118,
  bodegas_opened  INTEGER DEFAULT 0,
  items_sold      INTEGER DEFAULT 0,
  items_repaired  INTEGER DEFAULT 0,
  trades_done     INTEGER DEFAULT 0,
  bj_wins         INTEGER DEFAULT 0,
  bj_losses       INTEGER DEFAULT 0,
  bj_best_streak  INTEGER DEFAULT 0,
  total_earned    BIGINT  DEFAULT 0,
  total_spent     BIGINT  DEFAULT 0,
  daily_last      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── INVENTARIO ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  catalog_id  VARCHAR(50) NOT NULL,
  rarity      VARCHAR(20) NOT NULL CHECK (rarity IN ('common','rare','epic','legendary','unique')),
  condition   VARCHAR(20) NOT NULL CHECK (condition IN ('new','used','damaged','very_damaged')),
  grade       SMALLINT    NOT NULL CHECK (grade BETWEEN 1 AND 10),
  identified  BOOLEAN     DEFAULT TRUE,
  for_sale    BOOLEAN     DEFAULT FALSE,
  value       INTEGER     NOT NULL CHECK (value >= 0),
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_items_user_id   ON items(user_id);
CREATE INDEX idx_items_for_sale  ON items(for_sale) WHERE for_sale = TRUE;
CREATE INDEX idx_items_rarity    ON items(rarity);

-- ── COLECCIÓN DESCUBIERTA ─────────────────────────────────
CREATE TABLE IF NOT EXISTS collection (
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  catalog_id    VARCHAR(50) NOT NULL,
  first_found_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, catalog_id)
);

-- ── LOGROS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) NOT NULL,
  unlocked_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- ── TRANSACCIONES / HISTORIAL ECONÓMICO ───────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(30) NOT NULL, -- 'bodega_purchase','item_sold','repair','daily','bj_win','bj_loss','trade'
  amount      INTEGER     NOT NULL, -- positivo = ganancia, negativo = gasto
  item_id     UUID        REFERENCES items(id) ON DELETE SET NULL,
  npc_id      VARCHAR(50),
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tx_user_id    ON transactions(user_id);
CREATE INDEX idx_tx_created_at ON transactions(created_at DESC);

-- ── OFERTAS DE NPC (COMPRAS) ──────────────────────────────
CREATE TABLE IF NOT EXISTS npc_offers (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  npc_id     VARCHAR(50) NOT NULL,
  item_id    UUID        NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  price      INTEGER     NOT NULL,
  phrase     TEXT,
  status     VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','expired')),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '48 hours',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_npc_offers_user   ON npc_offers(user_id, status);
CREATE INDEX idx_npc_offers_item   ON npc_offers(item_id);

-- ── TRATOS NPC (INTERCAMBIOS) ─────────────────────────────
CREATE TABLE IF NOT EXISTS npc_trades (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  npc_id       VARCHAR(50) NOT NULL,
  want_items   UUID[]      NOT NULL,  -- array de item IDs
  give_catalog VARCHAR(50) NOT NULL,
  give_rarity  VARCHAR(20) NOT NULL,
  phrase       TEXT,
  status       VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','expired')),
  expires_at   TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_npc_trades_user ON npc_trades(user_id, status);

-- ── SESIONES JWT (blacklist para logout) ──────────────────
CREATE TABLE IF NOT EXISTS token_blacklist (
  jti        UUID        PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL
);

-- limpiar tokens expirados automáticamente (pg cron o manual)
CREATE INDEX idx_token_bl_exp ON token_blacklist(expires_at);

-- ── NOTIFICACIONES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message    TEXT        NOT NULL,
  read       BOOLEAN     DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user_unread ON notifications(user_id, read) WHERE read = FALSE;

-- ── FUNCIÓN: actualizar updated_at automáticamente ────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
