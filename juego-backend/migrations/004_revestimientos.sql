-- Catálogo de revestimientos
CREATE TABLE IF NOT EXISTS revestimiento_catalog (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  rarity      TEXT NOT NULL,
  description TEXT,
  css_class   TEXT NOT NULL
);

-- Revestimientos que posee cada usuario (UNIQUE previene duplicados)
CREATE TABLE IF NOT EXISTS user_revestimientos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  catalog_id  TEXT NOT NULL REFERENCES revestimiento_catalog(id),
  obtained_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, catalog_id)
);

CREATE INDEX IF NOT EXISTS idx_user_rev ON user_revestimientos(user_id);

-- Revestimiento activo en user_stats
ALTER TABLE user_stats
  ADD COLUMN IF NOT EXISTS active_revestimiento TEXT REFERENCES revestimiento_catalog(id);

-- Seed: 25 revestimientos
INSERT INTO revestimiento_catalog (id, name, rarity, description, css_class) VALUES
  -- Común (5)
  ('madera_rustica',      'Madera Rústica',       'common',    'Marco de madera sin tratar con vetas naturales.',           'rev-madera-rustica'),
  ('piedra_gris',         'Piedra Gris',           'common',    'Marco de piedra pulida, sobrio y resistente.',              'rev-piedra-gris'),
  ('tela_beige',          'Tela Beige',            'common',    'Marco tapizado en tela suave color crema.',                 'rev-tela-beige'),
  ('bambu',               'Bambú',                 'common',    'Marco de bambú natural, ligero y elegante.',                'rev-bambu'),
  ('cuero_marron',        'Cuero Marrón',          'common',    'Marco de cuero genuino cosido a mano.',                    'rev-cuero-marron'),
  -- Raro (7)
  ('marmol',              'Mármol',                'rare',      'Marco de mármol blanco con vetas grises y brillo suave.',  'rev-marmol'),
  ('metal_plateado',      'Metal Plateado',        'rare',      'Marco de aluminio pulido con reflejos plateados.',          'rev-metal-plateado'),
  ('cuero_negro',         'Cuero Negro',           'rare',      'Marco de cuero negro con costuras visibles.',               'rev-cuero-negro'),
  ('terciopelo_azul',     'Terciopelo Azul',       'rare',      'Marco tapizado en terciopelo azul real.',                   'rev-terciopelo-azul'),
  ('madera_lacada',       'Madera Lacada',         'rare',      'Marco de madera con acabado brillante lacado.',             'rev-madera-lacada'),
  ('cobre',               'Cobre Pulido',          'rare',      'Marco de cobre con brillo cálido y rojizo.',               'rev-cobre'),
  ('jade',                'Jade Verde',            'rare',      'Marco de jade con suave brillo verdoso.',                  'rev-jade'),
  -- Épico (7)
  ('cristal_azul',        'Cristal Azul',          'epic',      'Marco de cristal azul con pulso luminoso.',                'rev-cristal-azul'),
  ('obsidiana',           'Obsidiana',             'epic',      'Marco de obsidiana oscura con reflejos púrpura.',          'rev-obsidiana'),
  ('terciopelo_purpura',  'Terciopelo Púrpura',    'epic',      'Marco de terciopelo púrpura con aura pulsante.',           'rev-terciopelo-purpura'),
  ('titanio',             'Titanio',               'epic',      'Marco de titanio con brillo metálico azulado.',            'rev-titanio'),
  ('ambar',               'Ámbar',                 'epic',      'Marco de ámbar con resplandor cálido dorado.',             'rev-ambar'),
  ('bronce_antiguo',      'Bronce Antiguo',        'epic',      'Marco de bronce envejecido con pátina verde.',             'rev-bronce-antiguo'),
  ('esmeralda',           'Esmeralda',             'epic',      'Marco de esmeralda con pulso luminoso verde.',             'rev-esmeralda'),
  -- Legendario (4)
  ('llamas_rojas',        'Llamas Rojas',          'legendary', 'Marco envuelto en llamas rojas que nunca se apagan.',      'rev-llamas-rojas'),
  ('plasma_dorado',       'Plasma Dorado',         'legendary', 'Marco de plasma dorado en constante movimiento.',          'rev-plasma-dorado'),
  ('hielo_artico',        'Hielo Ártico',          'legendary', 'Marco de hielo ártico con cristales de escarcha.',        'rev-hielo-artico'),
  ('tormenta_electrica',  'Tormenta Eléctrica',    'legendary', 'Marco con destellos eléctricos recorriendo el borde.',    'rev-tormenta-electrica'),
  -- Único (2)
  ('arcoiris',            'Arcoíris',              'unique',    'Marco con todos los colores del espectro en movimiento.',  'rev-arcoiris'),
  ('galaxia',             'Galaxia',               'unique',    'Marco con nebulosas y estrellas en rotación cósmica.',    'rev-galaxia')
ON CONFLICT (id) DO NOTHING;
