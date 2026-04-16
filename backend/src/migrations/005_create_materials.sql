CREATE TABLE IF NOT EXISTS materials (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  type           TEXT NOT NULL CHECK (type IN ('filament', 'resin')),
  price_per_gram DECIMAL(10,6) NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
