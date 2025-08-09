import { Request } from 'express';
export type UserRole = 'super_admin' | 'owner' | 'manager' | 'cashier';
export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout';
export interface User {
    id: string;
    business_id?: string;
    email: string;
    password_hash: string;
    role: UserRole;
    first_name?: string;
    last_name?: string;
    active: boolean;
    last_login?: Date;
    created_at: Date;
    updated_at: Date;
}
export interface CreateUserDto {
    business_id?: string;
    email: string;
    password: string;
    role: UserRole;
    first_name?: string;
    last_name?: string;
}
export interface UpdateUserDto {
    email?: string;
    password?: string;
    role?: UserRole;
    first_name?: string;
    last_name?: string;
    active?: boolean;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: Omit<User, 'password_hash'>;
    access_token: string;
    refresh_token: string;
}
export interface Business {
    id: string;
    name: string;
    currency: string;
    timezone: string;
    created_at: Date | string;
    updated_at: Date | string;
    active: boolean;
    owner_name?: string;
    owner_email?: string;
}
export interface CreateBusinessDto {
    name: string;
    owner_name: string;
    owner_email: string;
    currency?: string;
    timezone?: string;
}
export interface UpdateBusinessDto {
    name?: string;
    currency?: string;
    timezone?: string;
    active?: boolean;
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
    created_at: Date;
    updated_at: Date;
}
export interface CreateProductDto {
    sku: string;
    name: string;
    description?: string;
    category?: string;
    cost_price: number;
    sell_price: number;
    tax_rate?: number;
    stock_qty?: number;
    low_stock_threshold?: number;
}
export interface UpdateProductDto {
    sku?: string;
    name?: string;
    description?: string;
    category?: string;
    cost_price?: number;
    sell_price?: number;
    tax_rate?: number;
    stock_qty?: number;
    low_stock_threshold?: number;
    active?: boolean;
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
    created_at: Date;
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
    created_at: Date;
    product?: Product;
}
export interface CreateSaleDto {
    items: CreateSaleItemDto[];
    subtotal: number;
    discount_amount?: number;
    tax_amount?: number;
    total: number;
    cash_received: number;
    change_due: number;
    notes?: string;
}
export interface CreateSaleItemDto {
    product_id: string;
    qty: number;
    sell_price_at_time: number;
    cost_price_at_time: number;
    line_total: number;
}
export interface AuditLog {
    id: string;
    business_id?: string;
    user_id?: string;
    action: AuditAction;
    entity: string;
    entity_id?: string;
    payload?: any;
    created_at: Date;
}
export interface DailySalesSummary {
    total_sales: number;
    total_transactions: number;
    total_items_sold: number;
    gross_profit: number;
    date_summary: Date;
}
export interface TopSellingProduct {
    product_id: string;
    product_name: string;
    total_qty_sold: number;
    total_revenue: number;
}
export interface LowStockProduct {
    id: string;
    sku: string;
    name: string;
    stock_qty: number;
    low_stock_threshold: number;
}
export interface DashboardData {
    daily_summary: DailySalesSummary;
    low_stock_products: LowStockProduct[];
    top_selling_products: TopSellingProduct[];
    low_stock_count: number;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}
export interface TokenPayload {
    user_id: string;
    business_id?: string;
    role: UserRole;
    email: string;
}
export interface RefreshToken {
    id: string;
    user_id: string;
    token_hash: string;
    expires_at: Date;
    created_at: Date;
}
export interface AuthenticatedRequest extends Request {
    user?: TokenPayload;
}
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
export interface EnvironmentConfig {
    PORT: number;
    NODE_ENV: string;
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    SUPABASE_ANON_KEY: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    BCRYPT_ROUNDS: number;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    SUPER_ADMIN_EMAIL: string;
    SUPER_ADMIN_PASSWORD: string;
}
//# sourceMappingURL=index.d.ts.map