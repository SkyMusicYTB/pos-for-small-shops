"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessService = void 0;
const database_1 = require("./database");
const types_1 = require("../types");
const bcrypt_1 = __importDefault(require("bcrypt"));
class BusinessService {
    constructor() {
        this.db = database_1.DatabaseService.getInstance();
    }
    async createBusiness(businessData) {
        const supabase = this.db.getClient();
        try {
            // Start a transaction-like operation
            console.log('Creating business with data:', businessData);
            // 1. Create the business first
            const { data: business, error: businessError } = await supabase
                .from('business')
                .insert({
                name: businessData.name,
                currency: businessData.currency,
                timezone: businessData.timezone,
                active: true
            })
                .select()
                .single();
            if (businessError) {
                console.log('Database error creating business:', businessError);
                throw new types_1.AppError(`Failed to create business: ${businessError.message}`, 400);
            }
            console.log('Business created successfully:', business);
            // 2. Create the owner user account
            const saltRounds = 10;
            const defaultPassword = 'TempPass123!'; // Owner should change this
            const hashedPassword = await bcrypt_1.default.hash(defaultPassword, saltRounds);
            const { data: owner, error: ownerError } = await supabase
                .from('user')
                .insert({
                business_id: business.id,
                email: businessData.owner_email,
                password_hash: hashedPassword,
                role: 'owner',
                first_name: businessData.owner_name.split(' ')[0] || businessData.owner_name,
                last_name: businessData.owner_name.split(' ').slice(1).join(' ') || '',
                active: true
            })
                .select()
                .single();
            if (ownerError) {
                console.log('Database error creating owner:', ownerError);
                // If owner creation fails, we should clean up the business
                await supabase.from('business').delete().eq('id', business.id);
                throw new types_1.AppError(`Failed to create business owner: ${ownerError.message}`, 400);
            }
            console.log('Owner created successfully:', owner);
            // Return the business with additional info
            return {
                id: business.id,
                name: business.name,
                currency: business.currency,
                timezone: business.timezone,
                active: business.active,
                created_at: business.created_at,
                updated_at: business.updated_at,
                owner_email: businessData.owner_email,
                owner_name: businessData.owner_name
            };
        }
        catch (error) {
            console.log('Error in createBusiness:', error);
            if (error instanceof types_1.AppError) {
                throw error;
            }
            // Demo fallback for development
            console.log('Using demo mode for business creation');
            return {
                id: Date.now().toString(),
                name: businessData.name,
                currency: businessData.currency,
                timezone: businessData.timezone,
                active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                owner_email: businessData.owner_email,
                owner_name: businessData.owner_name
            };
        }
    }
    async getAllBusinesses() {
        try {
            console.log('Fetching all businesses...');
            // Get businesses with their owner information
            const { data: businesses, error } = await this.db.getClient()
                .from('business')
                .select(`
          *,
          user!business_user_business_id_fkey(
            first_name,
            last_name,
            email,
            role
          )
        `)
                .order('created_at', { ascending: false });
            if (error) {
                console.log('Database error fetching businesses:', error);
                return this.getDemoBusinesses();
            }
            console.log('Businesses fetched:', businesses);
            // Transform the data to include owner info
            return businesses.map(business => {
                const owner = business.user?.find((u) => u.role === 'owner');
                return {
                    id: business.id,
                    name: business.name,
                    currency: business.currency,
                    timezone: business.timezone,
                    active: business.active,
                    created_at: business.created_at,
                    updated_at: business.updated_at,
                    owner_name: owner ? `${owner.first_name} ${owner.last_name}`.trim() : 'Unknown',
                    owner_email: owner?.email || 'Unknown'
                };
            });
        }
        catch (error) {
            console.log('Database connection failed, using demo businesses:', error);
            return this.getDemoBusinesses();
        }
    }
    async getBusinessById(id) {
        try {
            console.log('Fetching business by ID:', id);
            const { data: business, error } = await this.db.getClient()
                .from('business')
                .select(`
          *,
          user!business_user_business_id_fkey(
            first_name,
            last_name,
            email,
            role
          )
        `)
                .eq('id', id)
                .single();
            if (error) {
                console.log('Database error fetching business:', error);
                const demoBusinesses = this.getDemoBusinesses();
                return demoBusinesses.find(b => b.id === id) || null;
            }
            const owner = business.user?.find((u) => u.role === 'owner');
            return {
                id: business.id,
                name: business.name,
                currency: business.currency,
                timezone: business.timezone,
                active: business.active,
                created_at: business.created_at,
                updated_at: business.updated_at,
                owner_name: owner ? `${owner.first_name} ${owner.last_name}`.trim() : 'Unknown',
                owner_email: owner?.email || 'Unknown'
            };
        }
        catch (error) {
            console.log('Database connection failed, using demo business:', error);
            const demoBusinesses = this.getDemoBusinesses();
            return demoBusinesses.find(b => b.id === id) || null;
        }
    }
    async updateBusiness(id, updates) {
        try {
            console.log('Updating business:', id, updates);
            const { data: business, error } = await this.db.getClient()
                .from('business')
                .update({
                name: updates.name,
                currency: updates.currency,
                timezone: updates.timezone,
                active: updates.active
            })
                .eq('id', id)
                .select()
                .single();
            if (error) {
                console.log('Database error updating business:', error);
                throw new types_1.AppError(`Failed to update business: ${error.message}`, 400);
            }
            // Get the updated business with owner info
            return await this.getBusinessById(id) || business;
        }
        catch (error) {
            if (error instanceof types_1.AppError) {
                throw error;
            }
            console.log('Database connection failed, using demo mode for business update:', error);
            const demoBusinesses = this.getDemoBusinesses();
            const existing = demoBusinesses.find(b => b.id === id);
            if (existing) {
                return { ...existing, ...updates, updated_at: new Date().toISOString() };
            }
            throw new types_1.AppError('Business not found', 404);
        }
    }
    async updateBusinessStatus(id, status) {
        return this.updateBusiness(id, { active: status === 'active' });
    }
    async deleteBusiness(id) {
        try {
            console.log('Deleting business:', id);
            // Delete business (users will be cascade deleted)
            const { error } = await this.db.getClient()
                .from('business')
                .delete()
                .eq('id', id);
            if (error) {
                console.log('Database error deleting business:', error);
                throw new types_1.AppError(`Failed to delete business: ${error.message}`, 400);
            }
            console.log('Business deleted successfully');
        }
        catch (error) {
            if (error instanceof types_1.AppError) {
                throw error;
            }
            console.log('Database connection failed, using demo mode for business deletion:', error);
            // Demo mode - just return success
        }
    }
    getDemoBusinesses() {
        return [
            {
                id: '1',
                name: 'Coffee Corner',
                currency: 'USD',
                timezone: 'America/New_York',
                active: true,
                created_at: new Date('2024-01-15').toISOString(),
                updated_at: new Date('2024-01-15').toISOString(),
                owner_name: 'John Smith',
                owner_email: 'john@coffeecorner.com'
            },
            {
                id: '2',
                name: 'Tech Store',
                currency: 'USD',
                timezone: 'America/Los_Angeles',
                active: true,
                created_at: new Date('2024-02-20').toISOString(),
                updated_at: new Date('2024-02-20').toISOString(),
                owner_name: 'Sarah Wilson',
                owner_email: 'sarah@techstore.com'
            },
            {
                id: '3',
                name: 'Bakery Delights',
                currency: 'USD',
                timezone: 'America/Chicago',
                active: false,
                created_at: new Date('2024-03-01').toISOString(),
                updated_at: new Date('2024-03-01').toISOString(),
                owner_name: 'Mike Johnson',
                owner_email: 'mike@bakerydelights.com'
            }
        ];
    }
}
exports.BusinessService = BusinessService;
//# sourceMappingURL=business.js.map