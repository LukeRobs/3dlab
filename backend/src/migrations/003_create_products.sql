CREATE TABLE IF NOT EXISTS products (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL,
  slug               TEXT UNIQUE NOT NULL,
  description        TEXT,
  price              DECIMAL(10,2) NOT NULL DEFAULT 0,
  category_id        UUID REFERENCES categories(id),
  print_time_minutes INTEGER NOT NULL DEFAULT 0,
  cost_calculated    DECIMAL(10,4) NOT NULL DEFAULT 0,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  views_count        INTEGER NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_category_idx  ON products(category_id);
CREATE INDEX IF NOT EXISTS products_slug_idx      ON products(slug);
CREATE INDEX IF NOT EXISTS products_is_active_idx ON products(is_active);
