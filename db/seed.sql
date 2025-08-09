-- Demo seed (for local/dev). Do not use in production as-is.
-- Generate a fixed UUID for reproducibility
DO $$
DECLARE
  biz UUID := '11111111-1111-1111-1111-111111111111';
  owner UUID := gen_random_uuid();
BEGIN
  PERFORM set_config('app.current_business', biz::text, true);
  INSERT INTO business (id, name, currency, timezone, tax_default_enabled)
  VALUES (biz, 'Demo Shop', '$', 'UTC', true)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO product (sku, name, category, cost_price, sell_price, tax_rate, stock_qty, low_stock_threshold, active)
  VALUES
  ('SKU-001', 'Sample Soda', 'Beverages', 0.30, 1.00, 5.00, 100, 10, true),
  ('SKU-002', 'Sample Chips', 'Snacks', 0.20, 0.80, NULL, 50, 5, true)
  ON CONFLICT DO NOTHING;
END $$;