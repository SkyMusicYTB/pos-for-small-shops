"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("../utils/config");
class DatabaseService {
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(config_1.config.SUPABASE_URL, config_1.config.SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    getClient() {
        return this.supabase;
    }
    // Set the authenticated user context for RLS
    async setUserContext(userId) {
        await this.supabase.auth.admin.updateUserById(userId, {
            user_metadata: { last_context_set: new Date().toISOString() }
        });
    }
    // Execute raw SQL with parameters
    async executeRawSQL(query, params = []) {
        const { data, error } = await this.supabase.rpc('execute_sql', {
            sql: query,
            params: params
        });
        if (error) {
            throw new Error(`Database query failed: ${error.message}`);
        }
        return data;
    }
    // Test database connection
    async testConnection() {
        try {
            const { data, error } = await this.supabase
                .from('business')
                .select('count')
                .limit(1);
            return !error;
        }
        catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }
    // Health check
    async healthCheck() {
        try {
            const isConnected = await this.testConnection();
            return {
                status: isConnected ? 'healthy' : 'unhealthy',
                timestamp: new Date()
            };
        }
        catch (error) {
            console.log('Database connection failed, but continuing...');
            return {
                status: 'unhealthy',
                timestamp: new Date()
            };
        }
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database.js.map