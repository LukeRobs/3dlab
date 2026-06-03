INSERT INTO settings (key, value)
VALUES ('pix_discount_percent', '10')
ON CONFLICT (key) DO NOTHING;
