INSERT INTO settings (key, value)
VALUES
  ('pix_discount_percent', '10'),
  ('pix_popup_description', 'Use o PIX como forma de pagamento e ganhe desconto em todo pedido. Informe ao atendente no WhatsApp ao finalizar.')
ON CONFLICT (key) DO NOTHING;
