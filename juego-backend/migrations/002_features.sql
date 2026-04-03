-- ============================================================
-- BodegaVault — Migración v2: Perfil, Amigos, Subastas, Vitrina, Ruleta, Recompensas
-- ============================================================

-- ── VITRINA (showcase) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS showcase (
  user_id UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slot    SMALLINT NOT NULL CHECK (slot BETWEEN 1 AND 7),
  item_id UUID    REFERENCES items(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, slot)
);

-- ── AMIGOS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS friendships (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status    VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester, addressee)
);

CREATE INDEX idx_friendships_requester ON friendships(requester);
CREATE INDEX idx_friendships_addressee ON friendships(addressee);

-- ── SUBASTAS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS auctions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id   UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id     UUID    NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  min_bid     INTEGER NOT NULL CHECK (min_bid > 0),
  current_bid INTEGER,
  winner_id   UUID    REFERENCES users(id),
  ends_at     TIMESTAMPTZ NOT NULL,
  status      VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','ended')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auctions_active   ON auctions(status, ends_at) WHERE status = 'active';
CREATE INDEX idx_auctions_seller   ON auctions(seller_id);

-- ── PUJAS DE SUBASTA ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS auction_bids (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID    NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_id  UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount     INTEGER NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auction_bids_auction ON auction_bids(auction_id, created_at DESC);

-- ── NUEVAS COLUMNAS EN user_stats ────────────────────────
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS roulette_last        TIMESTAMPTZ;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS bodega_vouchers       INTEGER DEFAULT 0 CHECK (bodega_vouchers >= 0);
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS level_rewards_claimed INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS items_repaired        INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS trades_done           INTEGER DEFAULT 0;

-- ── NUEVAS COLUMNAS EN items ──────────────────────────────
ALTER TABLE items ADD COLUMN IF NOT EXISTS in_auction   BOOLEAN DEFAULT FALSE;
ALTER TABLE items ADD COLUMN IF NOT EXISTS is_exclusive BOOLEAN DEFAULT FALSE;

-- ── AVATAR EN USERS (si no existe ya) ────────────────────
ALTER TABLE users ALTER COLUMN avatar SET DEFAULT '🧑';
