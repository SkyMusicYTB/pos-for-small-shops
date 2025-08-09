# Modular POS (Multi-tenant) – Setup Guide

This project is a modular, multi-tenant POS for small shops. It runs a single API + Web UI, backed by a Postgres (Supabase) database with strict row-level security (RLS).

## Prerequisites
- Docker & Docker Compose
- A reachable Supabase Postgres instance (or any Postgres 14+/15+)
  - Example host: 10.228.3.80
  - Database: postgres (or your choice)
  - User/Password: postgres/postgres (adjust as needed)
  - Supabase ANON key (for future use). Not required for backend, but keep handy.

## 1) Database Setup (Supabase)
Run the following SQL in your Supabase project’s SQL editor (or psql) to initialize the schema and RLS. If you plan to use the API’s migration runner, you can skip this step; the API will apply the same migration automatically on startup. However, for clarity and manual setup, here is the full SQL:

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Roles enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('owner', 'manager', 'cashier', 'admin');
  END IF;
END $$;

-- Business
CREATE TABLE IF NOT EXISTS business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT '$',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  tax_default_enabled BOOLEAN NOT NULL DEFAULT false,
  roi_formula TEXT NOT NULL DEFAULT 'gross_profit / inventory_cost_on_hand',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users
CREATE TABLE IF NOT EXISTS user_account (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_email_unique_per_tenant UNIQUE (business_id, email),
  CONSTRAINT user_email_unique_admin UNIQUE (email) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT user_business_fk FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE
);

-- Default tenant binding for non-admin inserts
CREATE OR REPLACE FUNCTION set_default_business_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.business_id IS NULL AND NEW.role <> 'admin' THEN
    NEW.business_id := current_setting('app.current_business')::uuid;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_default_business_id ON user_account;
CREATE TRIGGER trg_set_default_business_id BEFORE INSERT ON user_account
FOR EACH ROW EXECUTE FUNCTION set_default_business_id();

-- Products
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

-- Sales
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

-- Sale items
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

-- Audit log
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

-- Enable RLS
ALTER TABLE business ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies
DROP POLICY IF EXISTS business_isolation ON business;
CREATE POLICY business_isolation ON business
  USING (id = current_setting('app.current_business')::uuid)
  WITH CHECK (id = current_setting('app.current_business')::uuid);

DROP POLICY IF EXISTS user_account_isolation ON user_account;
CREATE POLICY user_account_isolation ON user_account
  USING ((role = 'admin') OR (business_id = current_setting('app.current_business')::uuid))
  WITH CHECK ((role = 'admin' AND business_id IS NULL) OR (business_id = current_setting('app.current_business')::uuid));

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

-- Login helper (SECURITY DEFINER) to fetch user by email without RLS
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
```

Notes:
- The API automatically binds the tenant per request using `SELECT set_config('app.current_business', <tenant_uuid>, true)`, so RLS policies take effect.
- Admin users have `role = 'admin'` with `business_id = NULL` and can perform cross-tenant operations through dedicated admin endpoints.

## 2) Configure environment
Create an `.env` file or export environment variables used by the API:

```
DATABASE_URL=postgresql://postgres:postgres@10.228.3.80:5432/postgres
JWT_SECRET=change_me
JWT_REFRESH_SECRET=change_me_too
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
RATE_LIMIT_PER_MINUTE=60
APP_ENV=docker
SUPABASE_ANON_KEY=your_anon_key_here
```

Or edit `docker-compose.yml` to supply these values. The provided compose already sets the `DATABASE_URL` to the example IP.

## 3) Run the stack

```
docker compose up --build
```

What happens on startup:
- API applies migrations from `api/app/migrations` (idempotent) to your Supabase database.
- API creates a global admin if it does not exist:
  - email: `skymusicro@gmail.com`
  - password: `JindeILoveYou`
- Web is served at `http://localhost:5173`
- API is at `http://localhost:8000` with docs at `/docs`

## 4) Login and use
- Login as admin (above). As admin, you can:
  - POST `/admin/businesses` to create a business
  - POST `/admin/users` to add users
  - GET `/admin/audit` to view activity
- For tenant-bound users (owner/manager/cashier), use the UI to manage products, record sales, and view alerts/dashboard.

## 5) Backups & maintenance
- Backups can be handled using Supabase tools or `pg_dump` against your Supabase Postgres.
- The schema is applied by migrations; to add or change schema, add a new SQL file under `api/app/migrations/` and redeploy.

## 6) Troubleshooting
- Database connectivity: ensure your API container can reach 10.228.3.80:5432 and credentials are correct.
- RLS errors: check the tenant binding; API binds per request using the user’s `business_id`. Admin operations may not bind a tenant.
- Login issues: ensure the security definer function `app_get_users_by_email` exists and the admin was created.

## 7) Development without Docker (optional)
- API: `cd api && pip install -r requirements.txt && uvicorn app.main:app --reload`
- Web: `cd web && npm i && npm run dev`
- Ensure `DATABASE_URL` env points to your Supabase Postgres.
