"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessService = void 0;
const database_1 = require("./database");
const auth_1 = require("./auth");
const types_1 = require("../types");
class BusinessService {
    constructor() {
        this.db = database_1.DatabaseService.getInstance();
        this.authService = new auth_1.AuthService();
    }
    async createBusiness(createBusinessDto) {
        const { data: businesses, error } = await this.db.getClient()
            .from('business')
            .insert([{
                name: createBusinessDto.name,
                currency: createBusinessDto.currency || 'USD',
                timezone: createBusinessDto.timezone || 'UTC'
            }])
            .select()
            .limit(1);
        if (error) {
            throw new types_1.AppError('Failed to create business', 500);
        }
        return businesses[0];
    }
    async createBusinessWithOwner(createBusinessDto, ownerData) {
        try {
            // Create business
            const business = await this.createBusiness(createBusinessDto);
            // Create owner user
            const owner = await this.authService.createUser({
                ...ownerData,
                business_id: business.id,
                role: 'owner'
            });
            return { business, owner };
        }
        catch (error) {
            throw error;
        }
    }
    async getAllBusinesses() {
        const { data: businesses, error } = await this.db.getClient()
            .from('business')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            throw new types_1.AppError('Failed to fetch businesses', 500);
        }
        return businesses;
    }
    async getBusinessById(id) {
        const { data: businesses, error } = await this.db.getClient()
            .from('business')
            .select('*')
            .eq('id', id)
            .limit(1);
        if (error) {
            throw new types_1.AppError('Failed to fetch business', 500);
        }
        if (!businesses || businesses.length === 0) {
            return null;
        }
        return businesses[0];
    }
    async updateBusiness(id, updateBusinessDto) {
        const { data: businesses, error } = await this.db.getClient()
            .from('business')
            .update(updateBusinessDto)
            .eq('id', id)
            .select()
            .limit(1);
        if (error) {
            throw new types_1.AppError('Failed to update business', 500);
        }
        if (!businesses || businesses.length === 0) {
            throw new types_1.AppError('Business not found', 404);
        }
        return businesses[0];
    }
    async deleteBusiness(id) {
        const { error } = await this.db.getClient()
            .from('business')
            .delete()
            .eq('id', id);
        if (error) {
            throw new types_1.AppError('Failed to delete business', 500);
        }
    }
    async getBusinessUsers(businessId) {
        const { data: users, error } = await this.db.getClient()
            .from('user')
            .select('id, business_id, email, role, first_name, last_name, active, last_login, created_at, updated_at')
            .eq('business_id', businessId)
            .order('created_at', { ascending: false });
        if (error) {
            throw new types_1.AppError('Failed to fetch business users', 500);
        }
        return users;
    }
    async getBusinessStats(businessId) {
        try {
            // Get user stats
            const { count: totalUsers } = await this.db.getClient()
                .from('user')
                .select('*', { count: 'exact', head: true })
                .eq('business_id', businessId);
            const { count: activeUsers } = await this.db.getClient()
                .from('user')
                .select('*', { count: 'exact', head: true })
                .eq('business_id', businessId)
                .eq('active', true);
            // Get product stats
            const { count: totalProducts } = await this.db.getClient()
                .from('product')
                .select('*', { count: 'exact', head: true })
                .eq('business_id', businessId);
            const { count: activeProducts } = await this.db.getClient()
                .from('product')
                .select('*', { count: 'exact', head: true })
                .eq('business_id', businessId)
                .eq('active', true);
            // Get low stock products
            const { data: lowStockProducts } = await this.db.getClient()
                .from('product')
                .select('*')
                .eq('business_id', businessId)
                .eq('active', true)
                .filter('stock_qty', 'lte', 'low_stock_threshold');
            // Get today's sales
            const today = new Date().toISOString().split('T')[0];
            const { data: todaySales } = await this.db.getClient()
                .from('sale')
                .select('total')
                .eq('business_id', businessId)
                .gte('created_at', `${today}T00:00:00.000Z`)
                .lt('created_at', `${today}T23:59:59.999Z`);
            const todayTotal = todaySales?.reduce((sum, sale) => sum + parseFloat(sale.total), 0) || 0;
            const todayTransactions = todaySales?.length || 0;
            return {
                total_users: totalUsers || 0,
                active_users: activeUsers || 0,
                total_products: totalProducts || 0,
                active_products: activeProducts || 0,
                low_stock_products: lowStockProducts?.length || 0,
                today_sales: todayTotal,
                today_transactions: todayTransactions
            };
        }
        catch (error) {
            throw new types_1.AppError('Failed to fetch business statistics', 500);
        }
    }
    async toggleBusinessStatus(id) {
        // Get current status
        const business = await this.getBusinessById(id);
        if (!business) {
            throw new types_1.AppError('Business not found', 404);
        }
        // Toggle status
        return await this.updateBusiness(id, { active: !business.active });
    }
    async searchBusinesses(query) {
        const { data: businesses, error } = await this.db.getClient()
            .from('business')
            .select('*')
            .or(`name.ilike.%${query}%, currency.ilike.%${query}%`)
            .order('created_at', { ascending: false });
        if (error) {
            throw new types_1.AppError('Failed to search businesses', 500);
        }
        return businesses;
    }
}
exports.BusinessService = BusinessService;
//# sourceMappingURL=business.js.map