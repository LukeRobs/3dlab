CREATE TABLE IF NOT EXISTS product_materials (
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  -- material_id has NO ON DELETE CASCADE intentionally: deleting a material
  -- that is still referenced here must be blocked at the API layer (409 response).
  -- PostgreSQL's default NO ACTION will raise a FK constraint error as a safety net.
  material_id    UUID NOT NULL REFERENCES materials(id),
  quantity_grams DECIMAL(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, material_id)
);
