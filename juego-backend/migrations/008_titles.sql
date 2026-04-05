-- Add poker stats and titles support
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS poker_wins INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS poker_royal_flushes INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS equipped_title TEXT DEFAULT NULL;

CREATE TABLE IF NOT EXISTS user_titles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, title_id)
);
