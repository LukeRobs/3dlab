CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id),
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  total_price      DECIMAL(10,2) NOT NULL DEFAULT 0,
  whatsapp_message TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_user_idx   ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
