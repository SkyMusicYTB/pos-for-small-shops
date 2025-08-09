-- Insert the preset super-admin user
-- Password: Admin123! (hashed with bcrypt)
INSERT INTO "user" (
    id,
    business_id,
    email,
    password_hash,
    role,
    first_name,
    last_name,
    active,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    NULL, -- Super admin doesn't belong to any specific business
    'admin@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewvRwpQ1.L8bA6Km', -- Admin123!
    'super_admin',
    'Super',
    'Administrator',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create some sample categories for product categorization
-- Note: These are not table entries, just common category examples
-- Products will store category as VARCHAR for flexibility

-- Create a function to hash passwords (for future use)
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(user_id_param UUID, required_role user_role, business_id_param UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    user_role_found user_role;
    user_business_id UUID;
BEGIN
    SELECT role, business_id INTO user_role_found, user_business_id
    FROM "user" 
    WHERE id = user_id_param AND active = TRUE;
    
    -- If user not found or inactive
    IF user_role_found IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Super admin has access to everything
    IF user_role_found = 'super_admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user belongs to the specified business (if provided)
    IF business_id_param IS NOT NULL AND user_business_id != business_id_param THEN
        RETURN FALSE;
    END IF;
    
    -- Check role hierarchy: owner > manager > cashier
    CASE required_role
        WHEN 'cashier' THEN
            RETURN user_role_found IN ('owner', 'manager', 'cashier');
        WHEN 'manager' THEN
            RETURN user_role_found IN ('owner', 'manager');
        WHEN 'owner' THEN
            RETURN user_role_found = 'owner';
        WHEN 'super_admin' THEN
            RETURN user_role_found = 'super_admin';
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get low stock products for a business
CREATE OR REPLACE FUNCTION get_low_stock_products(business_id_param UUID)
RETURNS TABLE (
    id UUID,
    sku VARCHAR(100),
    name VARCHAR(255),
    stock_qty INTEGER,
    low_stock_threshold INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.sku,
        p.name,
        p.stock_qty,
        p.low_stock_threshold
    FROM product p
    WHERE p.business_id = business_id_param 
    AND p.active = TRUE
    AND p.stock_qty <= p.low_stock_threshold
    ORDER BY p.stock_qty ASC, p.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to calculate daily sales summary
CREATE OR REPLACE FUNCTION get_daily_sales_summary(business_id_param UUID, date_param DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    total_sales DECIMAL(10,2),
    total_transactions INTEGER,
    total_items_sold INTEGER,
    gross_profit DECIMAL(10,2),
    date_summary DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(s.total), 0) as total_sales,
        COUNT(s.id)::INTEGER as total_transactions,
        COALESCE(SUM(si.qty), 0)::INTEGER as total_items_sold,
        COALESCE(SUM(si.qty * (si.sell_price_at_time - si.cost_price_at_time)), 0) as gross_profit,
        date_param as date_summary
    FROM sale s
    LEFT JOIN sale_item si ON s.id = si.sale_id
    WHERE s.business_id = business_id_param
    AND DATE(s.created_at) = date_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get top selling products
CREATE OR REPLACE FUNCTION get_top_selling_products(
    business_id_param UUID, 
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    product_id UUID,
    product_name VARCHAR(255),
    total_qty_sold INTEGER,
    total_revenue DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as product_id,
        p.name as product_name,
        SUM(si.qty)::INTEGER as total_qty_sold,
        SUM(si.line_total) as total_revenue
    FROM product p
    INNER JOIN sale_item si ON p.id = si.product_id
    INNER JOIN sale s ON si.sale_id = s.id
    WHERE s.business_id = business_id_param
    AND DATE(s.created_at) BETWEEN start_date AND end_date
    GROUP BY p.id, p.name
    ORDER BY total_qty_sold DESC, total_revenue DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;