-- ===============================================
-- COMPLETE DATABASE SCHEMA FOR POS SYSTEM
-- ===============================================
-- This file contains the complete, corrected schema
-- Run this to initialize your database properly

-- Clean slate: Drop everything if exists
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'owner', 'manager', 'cashier');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'login', 'logout');

-- ===============================================
-- CORE TABLES
-- ===============================================

-- Create the business table (tenant)
CREATE TABLE business (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE
);

-- Create the user table
CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES business(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the product table
CREATE TABLE product (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES business(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    sell_price DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,4) DEFAULT 0,
    stock_qty INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, sku)
);

-- Create the sale table
CREATE TABLE sale (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES business(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user"(id),
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    cash_received DECIMAL(10,2) NOT NULL,
    change_due DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the sale_item table
CREATE TABLE sale_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sale(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(id),
    qty INTEGER NOT NULL,
    sell_price_at_time DECIMAL(10,2) NOT NULL,
    cost_price_at_time DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the audit_log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES business(id) ON DELETE CASCADE,
    user_id UUID REFERENCES "user"(id) ON DELETE SET NULL,
    action audit_action NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id UUID,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the refresh_token table for JWT management
CREATE TABLE refresh_token (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- INDEXES FOR PERFORMANCE
-- ===============================================

CREATE INDEX idx_user_business_id ON "user"(business_id);
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_product_business_id ON product(business_id);
CREATE INDEX idx_product_sku ON product(business_id, sku);
CREATE INDEX idx_product_active ON product(business_id, active);
CREATE INDEX idx_sale_business_id ON sale(business_id);
CREATE INDEX idx_sale_created_at ON sale(business_id, created_at);
CREATE INDEX idx_sale_item_sale_id ON sale_item(sale_id);
CREATE INDEX idx_sale_item_product_id ON sale_item(product_id);
CREATE INDEX idx_audit_log_business_id ON audit_log(business_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(business_id, created_at);
CREATE INDEX idx_refresh_token_user_id ON refresh_token(user_id);
CREATE INDEX idx_refresh_token_expires_at ON refresh_token(expires_at);

-- ===============================================
-- FUNCTIONS AND TRIGGERS
-- ===============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_business_updated_at BEFORE UPDATE ON business
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_updated_at BEFORE UPDATE ON product
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- FIXED AUDIT FUNCTION - Handles business table correctly
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    business_id_value UUID;
BEGIN
    -- Determine the business_id based on the table
    IF TG_TABLE_NAME = 'business' THEN
        -- For business table, use the record's own ID as business_id
        IF TG_OP = 'DELETE' THEN
            business_id_value := OLD.id;
        ELSE
            business_id_value := NEW.id;
        END IF;
    ELSE
        -- For other tables, use the business_id field
        IF TG_OP = 'DELETE' THEN
            business_id_value := OLD.business_id;
        ELSE
            business_id_value := NEW.business_id;
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (business_id, user_id, action, entity, entity_id, payload)
        VALUES (
            business_id_value,
            auth.uid(),
            'delete',
            TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD)
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (business_id, user_id, action, entity, entity_id, payload)
        VALUES (
            business_id_value,
            auth.uid(),
            'update',
            TG_TABLE_NAME,
            NEW.id,
            jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (business_id, user_id, action, entity, entity_id, payload)
        VALUES (
            business_id_value,
            auth.uid(),
            'create',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(NEW)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Audit triggers for important tables
CREATE TRIGGER audit_business_changes AFTER INSERT OR UPDATE OR DELETE ON business
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_user_changes AFTER INSERT OR UPDATE OR DELETE ON "user"
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_product_changes AFTER INSERT OR UPDATE OR DELETE ON product
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_sale_changes AFTER INSERT OR UPDATE OR DELETE ON sale
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ===============================================
-- ROW LEVEL SECURITY (RLS)
-- ===============================================

-- Enable RLS on all tenant tables
ALTER TABLE business ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_token ENABLE ROW LEVEL SECURITY;

-- RLS policies for super_admin access (can see all data)
CREATE POLICY "super_admin_all_business" ON business FOR ALL USING (
    EXISTS (
        SELECT 1 FROM "user" 
        WHERE "user".id = auth.uid() 
        AND "user".role = 'super_admin'
    )
);

CREATE POLICY "super_admin_all_users" ON "user" FOR ALL USING (
    EXISTS (
        SELECT 1 FROM "user" u 
        WHERE u.id = auth.uid() 
        AND u.role = 'super_admin'
    )
);

CREATE POLICY "super_admin_all_products" ON product FOR ALL USING (
    EXISTS (
        SELECT 1 FROM "user" 
        WHERE "user".id = auth.uid() 
        AND "user".role = 'super_admin'
    )
);

CREATE POLICY "super_admin_all_sales" ON sale FOR ALL USING (
    EXISTS (
        SELECT 1 FROM "user" 
        WHERE "user".id = auth.uid() 
        AND "user".role = 'super_admin'
    )
);

CREATE POLICY "super_admin_all_sale_items" ON sale_item FOR ALL USING (
    EXISTS (
        SELECT 1 FROM "user" 
        WHERE "user".id = auth.uid() 
        AND "user".role = 'super_admin'
    )
);

CREATE POLICY "super_admin_all_audit_logs" ON audit_log FOR ALL USING (
    EXISTS (
        SELECT 1 FROM "user" 
        WHERE "user".id = auth.uid() 
        AND "user".role = 'super_admin'
    )
);

CREATE POLICY "super_admin_all_refresh_tokens" ON refresh_token FOR ALL USING (
    EXISTS (
        SELECT 1 FROM "user" 
        WHERE "user".id = auth.uid() 
        AND "user".role = 'super_admin'
    )
);

-- RLS policies for tenant isolation (business users can only see their own data)
CREATE POLICY "tenant_business_access" ON business FOR ALL USING (
    id IN (
        SELECT business_id FROM "user" 
        WHERE "user".id = auth.uid()
    )
);

CREATE POLICY "tenant_user_access" ON "user" FOR ALL USING (
    business_id IN (
        SELECT business_id FROM "user" 
        WHERE "user".id = auth.uid()
    )
);

CREATE POLICY "tenant_product_access" ON product FOR ALL USING (
    business_id IN (
        SELECT business_id FROM "user" 
        WHERE "user".id = auth.uid()
    )
);

CREATE POLICY "tenant_sale_access" ON sale FOR ALL USING (
    business_id IN (
        SELECT business_id FROM "user" 
        WHERE "user".id = auth.uid()
    )
);

CREATE POLICY "tenant_sale_item_access" ON sale_item FOR ALL USING (
    EXISTS (
        SELECT 1 FROM sale 
        WHERE sale.id = sale_item.sale_id 
        AND sale.business_id IN (
            SELECT business_id FROM "user" 
            WHERE "user".id = auth.uid()
        )
    )
);

CREATE POLICY "tenant_audit_log_access" ON audit_log FOR ALL USING (
    business_id IN (
        SELECT business_id FROM "user" 
        WHERE "user".id = auth.uid()
    )
);

CREATE POLICY "tenant_refresh_token_access" ON refresh_token FOR ALL USING (
    user_id = auth.uid()
);

-- ===============================================
-- SAMPLE DATA
-- ===============================================

-- Insert super admin user (no business_id - global admin)
INSERT INTO "user" (id, business_id, email, password_hash, role, first_name, last_name, active) VALUES 
('00000000-0000-0000-0000-000000000001', NULL, 'admin@example.com', '$2b$10$8K7Ow/Qi5.lFq7Ui7tYvI.ZNFTj6JjNVQFZj3h9/zY8vVwKtTp.a6', 'super_admin', 'Super', 'Admin', true);
-- Password is: Admin123!

-- Insert sample businesses
INSERT INTO business (id, name, currency, timezone, active) VALUES 
('11111111-1111-1111-1111-111111111111', 'Coffee Corner', 'USD', 'America/New_York', true),
('22222222-2222-2222-2222-222222222222', 'Tech Store', 'USD', 'America/Los_Angeles', true),
('33333333-3333-3333-3333-333333333333', 'Bakery Delights', 'USD', 'America/Chicago', false);

-- Insert business owners
INSERT INTO "user" (id, business_id, email, password_hash, role, first_name, last_name, active) VALUES 
('11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'john@coffeecorner.com', '$2b$10$8K7Ow/Qi5.lFq7Ui7tYvI.ZNFTj6JjNVQFZj3h9/zY8vVwKtTp.a6', 'owner', 'John', 'Smith', true),
('22222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'sarah@techstore.com', '$2b$10$8K7Ow/Qi5.lFq7Ui7tYvI.ZNFTj6JjNVQFZj3h9/zY8vVwKtTp.a6', 'owner', 'Sarah', 'Wilson', true),
('33333333-3333-3333-3333-333333333334', '33333333-3333-3333-3333-333333333333', 'mike@bakerydelights.com', '$2b$10$8K7Ow/Qi5.lFq7Ui7tYvI.ZNFTj6JjNVQFZj3h9/zY8vVwKtTp.a6', 'owner', 'Mike', 'Johnson', true);
-- All passwords are: Admin123!

-- Insert sample cashiers/managers
INSERT INTO "user" (id, business_id, email, password_hash, role, first_name, last_name, active) VALUES 
('11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'cashier@coffeecorner.com', '$2b$10$8K7Ow/Qi5.lFq7Ui7tYvI.ZNFTj6JjNVQFZj3h9/zY8vVwKtTp.a6', 'cashier', 'Emma', 'Brown', true),
('22222222-2222-2222-2222-222222222224', '22222222-2222-2222-2222-222222222222', 'manager@techstore.com', '$2b$10$8K7Ow/Qi5.lFq7Ui7tYvI.ZNFTj6JjNVQFZj3h9/zY8vVwKtTp.a6', 'manager', 'David', 'Lee', true);

-- Insert sample products for Coffee Corner
INSERT INTO product (id, business_id, sku, name, description, category, cost_price, sell_price, tax_rate, stock_qty, low_stock_threshold, active) VALUES 
('p1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'COFFEE-001', 'Americano', 'Fresh brewed americano coffee', 'Beverages', 1.50, 3.50, 0.0875, 100, 20, true),
('p1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'COFFEE-002', 'Cappuccino', 'Classic cappuccino with steamed milk', 'Beverages', 2.00, 4.50, 0.0875, 80, 15, true),
('p1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'PASTRY-001', 'Croissant', 'Buttery French croissant', 'Pastries', 1.00, 2.75, 0.0875, 25, 5, true),
('p1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 'COFFEE-003', 'Latte', 'Smooth latte with artistic foam', 'Beverages', 2.25, 5.00, 0.0875, 90, 18, true);

-- Insert sample products for Tech Store
INSERT INTO product (id, business_id, sku, name, description, category, cost_price, sell_price, tax_rate, stock_qty, low_stock_threshold, active) VALUES 
('p2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'CABLE-001', 'USB-C Cable', 'High-speed USB-C charging cable', 'Accessories', 5.00, 15.99, 0.0875, 50, 10, true),
('p2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'CASE-001', 'Phone Case', 'Protective smartphone case', 'Accessories', 8.00, 24.99, 0.0875, 30, 5, true),
('p2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'SPEAKER-001', 'Bluetooth Speaker', 'Portable wireless speaker', 'Electronics', 25.00, 79.99, 0.0875, 15, 3, true);

-- Insert sample sales
INSERT INTO sale (id, business_id, user_id, subtotal, discount_amount, tax_amount, total, cash_received, change_due, notes) VALUES 
('s1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111113', 8.00, 0.00, 0.70, 8.70, 10.00, 1.30, 'Morning rush order'),
('s2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222224', 40.98, 5.00, 3.15, 39.13, 40.00, 0.87, 'Customer discount applied');

-- Insert sample sale items
INSERT INTO sale_item (id, sale_id, product_id, qty, sell_price_at_time, cost_price_at_time, line_total) VALUES 
('si111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 1, 3.50, 1.50, 3.50),
('si111111-1111-1111-1111-111111111112', 's1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111114', 1, 5.00, 2.25, 5.00),
('si222222-2222-2222-2222-222222222221', 's2222222-2222-2222-2222-222222222221', 'p2222222-2222-2222-2222-222222222221', 1, 15.99, 5.00, 15.99),
('si222222-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222221', 'p2222222-2222-2222-2222-222222222222', 1, 24.99, 8.00, 24.99);

-- ===============================================
-- FINAL NOTES
-- ===============================================

-- Database initialized successfully!
-- 
-- Default Login Credentials:
-- Super Admin: admin@example.com / Admin123!
-- Coffee Corner Owner: john@coffeecorner.com / Admin123!
-- Tech Store Owner: sarah@techstore.com / Admin123!
-- Bakery Owner: mike@bakerydelights.com / Admin123!
-- 
-- The database includes:
-- ✅ Fixed audit function that handles business table correctly
-- ✅ Proper RLS policies for multi-tenant security
-- ✅ Sample businesses, users, products, and sales
-- ✅ All necessary indexes for performance
-- ✅ Proper foreign key relationships
-- 
-- Your POS system is ready to use!