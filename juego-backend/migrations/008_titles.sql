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

-- Auto-grant titles to users who already earned the qualifying achievements
INSERT INTO user_titles (user_id, title_id)
SELECT user_id, achievement_id
FROM achievements
WHERE achievement_id IN ('collector_all','level_50','millionaire','poker_royal','bodega_50')
ON CONFLICT DO NOTHING;
