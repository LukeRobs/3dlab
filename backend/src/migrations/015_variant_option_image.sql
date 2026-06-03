-- Add image_url to variant options so selecting a variant can swap the product photo
ALTER TABLE product_variant_options ADD COLUMN IF NOT EXISTS image_url TEXT;
