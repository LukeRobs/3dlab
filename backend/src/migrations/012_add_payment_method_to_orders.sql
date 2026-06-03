ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'full'
    CHECK (payment_method IN ('pix', 'full'));
