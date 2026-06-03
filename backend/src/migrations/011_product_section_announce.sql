-- Add section column to products for vitrine management
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS section TEXT
    CHECK (section IN ('lancamentos', 'prevenda', 'promocao'));

-- Add announcement bar message settings
INSERT INTO settings (key, value) VALUES
  ('announce_msg_1', 'Frete grátis a partir de <strong>R$ 300,00</strong>'),
  ('announce_msg_2', '5% OFF na primeira compra — Cupom: <strong>3DMAX</strong>'),
  ('announce_msg_3', '10% de desconto pagando no <strong>PIX</strong>')
ON CONFLICT (key) DO NOTHING;
