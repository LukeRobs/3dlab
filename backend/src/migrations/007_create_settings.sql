CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO settings (key, value) VALUES
  ('whatsapp_number',       ''),
  ('electricity_kwh_price', '0'),
  ('printer_power_watts',   '0'),
  ('store_name',            'Minha Loja'),
  ('store_description',     '')
ON CONFLICT (key) DO NOTHING;
