-- Tabla para registrar qué recompensas de catálogo ya recibió cada usuario
CREATE TABLE IF NOT EXISTS category_rewards (
  user_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category   TEXT    NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, category)
);
