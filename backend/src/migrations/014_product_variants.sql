-- Variant groups (e.g. "Cor", "Tamanho", "Modelo")
CREATE TABLE IF NOT EXISTS product_variant_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual options per group (e.g. "Vermelho", "P", "Gomu Gomu no Mi")
CREATE TABLE IF NOT EXISTS product_variant_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES product_variant_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add selected_variants to cart_items
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS selected_variants JSONB DEFAULT '{}';

-- Drop old unique constraint so same product can be in cart with different variants
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;
