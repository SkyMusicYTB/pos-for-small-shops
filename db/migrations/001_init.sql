-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- App config GUC for current business
-- (No schema changes needed, we will SET this per-connection from the API)

-- Types
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('owner', 'manager', 'cashier');
  END IF;
END $$;

-- Tables
CREATE TABLE IF NOT EXISTS business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT '$',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  tax_default_enabled BOOLEAN NOT NULL DEFAULT false,
  roi_formula TEXT NOT NULL DEFAULT 'gross_profit / inventory_cost_on_hand',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_account (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL DEFAULT current_setting('app.current_business')::uuid,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, email),
  FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL DEFAULT current_setting('app.current_business')::uuid,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  cost_price NUMERIC(12,2) NOT NULL CHECK (cost_price >= 0),
  sell_price NUMERIC(12,2) NOT NULL CHECK (sell_price >= 0),
  tax_rate NUMERIC(5,2),
  stock_qty NUMERIC(14,3) NOT NULL DEFAULT 0,
  low_stock_threshold NUMERIC(14,3) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, sku),
  FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sale (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL DEFAULT current_setting('app.current_business')::uuid,
  user_id UUID NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  cash_received NUMERIC(12,2) NOT NULL,
  change_due NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user_account(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sale_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL DEFAULT current_setting('app.current_business')::uuid,
  sale_id UUID NOT NULL,
  product_id UUID NOT NULL,
  qty NUMERIC(14,3) NOT NULL CHECK (qty > 0),
  sell_price_at_time NUMERIC(12,2) NOT NULL,
  cost_price_at_time NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(12,2) NOT NULL,
  FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
  FOREIGN KEY (sale_id) REFERENCES sale(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL DEFAULT current_setting('app.current_business')::uuid,
  user_id UUID,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user_account(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_business_active ON product(business_id, active);
CREATE INDEX IF NOT EXISTS idx_product_low_stock ON product(business_id, stock_qty, low_stock_threshold);
CREATE INDEX IF NOT EXISTS idx_sale_business_created_at ON sale(business_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sale_item_sale ON sale_item(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_item_product ON sale_item(product_id);

-- RLS policies
ALTER TABLE business ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Business: owner can see only own business by setting
DROP POLICY IF EXISTS business_isolation ON business;
CREATE POLICY business_isolation ON business
  USING (id = current_setting('app.current_business')::uuid)
  WITH CHECK (id = current_setting('app.current_business')::uuid);

-- Generic policy template for tables with business_id
DO $$ BEGIN
  PERFORM 1; -- placeholder to allow DO block
END $$;

DROP POLICY IF EXISTS user_account_isolation ON user_account;
CREATE POLICY user_account_isolation ON user_account
  USING (business_id = current_setting('app.current_business')::uuid)
  WITH CHECK (business_id = current_setting('app.current_business')::uuid);

DROP POLICY IF EXISTS product_isolation ON product;
CREATE POLICY product_isolation ON product
  USING (business_id = current_setting('app.current_business')::uuid)
  WITH CHECK (business_id = current_setting('app.current_business')::uuid);

DROP POLICY IF EXISTS sale_isolation ON sale;
CREATE POLICY sale_isolation ON sale
  USING (business_id = current_setting('app.current_business')::uuid)
  WITH CHECK (business_id = current_setting('app.current_business')::uuid);

DROP POLICY IF EXISTS sale_item_isolation ON sale_item;
CREATE POLICY sale_item_isolation ON sale_item
  USING (business_id = current_setting('app.current_business')::uuid)
  WITH CHECK (business_id = current_setting('app.current_business')::uuid);

DROP POLICY IF EXISTS audit_log_isolation ON audit_log;
CREATE POLICY audit_log_isolation ON audit_log
  USING (business_id = current_setting('app.current_business')::uuid)
  WITH CHECK (business_id = current_setting('app.current_business')::uuid);

-- Helpful view for dashboard aggregates (optional). We'll compute via queries in API.

-- Auth helper: fetch user by email without RLS using SECURITY DEFINER
CREATE OR REPLACE FUNCTION app_get_users_by_email(p_email TEXT)
RETURNS TABLE(
  id UUID,
  business_id UUID,
  email TEXT,
  password_hash TEXT,
  role user_role,
  active BOOLEAN
) AS $$
  SELECT u.id, u.business_id, u.email, u.password_hash, u.role, u.active
  FROM user_account u
  WHERE u.email = p_email;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION app_get_users_by_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_get_users_by_email(TEXT) TO PUBLIC;