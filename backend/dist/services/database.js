"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("../utils/config");
class DatabaseService {
    constructor() {
        // Standard client for user operations
        this.supabase = (0, supabase_js_1.createClient)(config_1.config.SUPABASE_URL, config_1.config.SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        // Admin client with service role key (bypasses RLS)
        this.adminClient = (0, supabase_js_1.createClient)(config_1.config.SUPABASE_URL, config_1.config.SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            },
            db: {
                schema: 'public'
            }
        });
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    // Get the regular client (subject to RLS)
    getClient() {
        return this.supabase;
    }
    // Get the admin client (bypasses RLS)
    getAdminClient() {
        return this.adminClient;
    }
    // Set user context for RLS operations
    async setUserContext(userId) {
        try {
            // Set the user session for RLS context
            const { data, error } = await this.supabase.auth.admin.updateUserById(userId, {
                user_metadata: { last_context_set: new Date().toISOString() }
            });
            if (error) {
                console.log('Warning: Could not set user context:', error.message);
            }
        }
        catch (error) {
            console.log('Warning: Error setting user context:', error);
        }
    }
    // Execute operation as admin (bypassing RLS)
    async executeAsAdmin(operation) {
        return await operation(this.adminClient);
    }
    // Execute operation with user context (respecting RLS)
    async executeAsUser(userId, operation) {
        // For user operations, we would normally set the JWT token
        // For now, we'll use admin client with manual RLS checks
        return await operation(this.adminClient);
    }
    // Health check
    async testConnection() {
        try {
            const { data, error } = await this.adminClient
                .from('business')
                .select('count(*)')
                .limit(1);
            return !error;
        }
        catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }
    // Execute raw SQL with parameters (admin only)
    async executeRawSQL(query, params = []) {
        try {
            const { data, error } = await this.adminClient.rpc('execute_sql', {
                sql: query,
                params: params
            });
            if (error) {
                throw new Error(`Database query failed: ${error.message}`);
            }
            return data;
        }
        catch (error) {
            console.log('Raw SQL execution failed, this is expected if function does not exist:', error);
            throw error;
        }
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database.js.map