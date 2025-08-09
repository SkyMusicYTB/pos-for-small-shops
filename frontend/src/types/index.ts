// User and Authentication Types
export type UserRole = 'super_admin' | 'owner' | 'manager' | 'cashier';

export interface User {
  id: string;
  business_id?: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Business {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  created_at: string;
  updated_at: string;
  active: boolean;
}

export interface Product {
  id: string;
  business_id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  cost_price: number;
  sell_price: number;
  tax_rate?: number;
  stock_qty: number;
  low_stock_threshold: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  business_id: string;
  user_id: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  cash_received: number;
  change_due: number;
  notes?: string;
  created_at: string;
  items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  qty: number;
  sell_price_at_time: number;
  cost_price_at_time: number;
  line_total: number;
  created_at: string;
  product?: Product;
}

export interface DashboardData {
  daily_summary: {
    total_sales: number;
    total_transactions: number;
    total_items_sold: number;
    gross_profit: number;
    date_summary: string;
  };
  low_stock_products: Array<{
    id: string;
    sku: string;
    name: string;
    stock_qty: number;
    low_stock_threshold: number;
  }>;
  top_selling_products: Array<{
    product_id: string;
    product_name: string;
    total_qty_sold: number;
    total_revenue: number;
  }>;
  low_stock_count: number;
}