"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const pg_1 = require("pg");
const config_1 = require("../utils/config");
class DatabaseService {
    constructor() {
        // Determine connection type based on available configuration
        if (config_1.config.DATABASE_URL) {
            this.connectionType = 'postgresql';
            this.initializePostgreSQL();
        }
        else if (config_1.config.SUPABASE_URL && config_1.config.SUPABASE_SERVICE_ROLE_KEY) {
            this.connectionType = 'supabase';
            this.initializeSupabase();
        }
        else {
            throw new Error('No valid database configuration found');
        }
    }
    initializePostgreSQL() {
        if (!config_1.config.DATABASE_URL) {
            throw new Error('DATABASE_URL is required for PostgreSQL connection');
        }
        this.pool = new pg_1.Pool({
            connectionString: config_1.config.DATABASE_URL,
            // Connection pool settings
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        console.log('✅ PostgreSQL connection pool initialized');
    }
    initializeSupabase() {
        if (!config_1.config.SUPABASE_URL || !config_1.config.SUPABASE_SERVICE_ROLE_KEY || !config_1.config.SUPABASE_ANON_KEY) {
            throw new Error('SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_ANON_KEY are required');
        }
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
        console.log('✅ Supabase clients initialized');
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    // Get connection type
    getConnectionType() {
        return this.connectionType;
    }
    // PostgreSQL methods
    async query(text, params) {
        if (this.connectionType !== 'postgresql' || !this.pool) {
            throw new Error('PostgreSQL connection not available');
        }
        const client = await this.pool.connect();
        try {
            const result = await client.query(text, params);
            return result;
        }
        finally {
            client.release();
        }
    }
    async getClient() {
        if (this.connectionType !== 'postgresql' || !this.pool) {
            throw new Error('PostgreSQL connection not available');
        }
        return await this.pool.connect();
    }
    // Supabase methods (for compatibility)
    getSupabaseClient() {
        if (this.connectionType !== 'supabase' || !this.supabase) {
            throw new Error('Supabase connection not available');
        }
        return this.supabase;
    }
    getAdminClient() {
        if (this.connectionType !== 'supabase' || !this.adminClient) {
            throw new Error('Supabase admin client not available');
        }
        return this.adminClient;
    }
    // Unified methods that work with both connection types
    async testConnection() {
        try {
            if (this.connectionType === 'postgresql') {
                const result = await this.query('SELECT 1');
                return result.rows.length > 0;
            }
            else {
                const { data, error } = await this.adminClient
                    .from('business')
                    .select('count(*)')
                    .limit(1);
                return !error;
            }
        }
        catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }
    // Business operations - unified interface
    async createBusiness(businessData) {
        if (this.connectionType === 'postgresql') {
            const client = await this.getClient();
            try {
                await client.query('BEGIN');
                // Insert business
                const businessResult = await client.query('INSERT INTO business (name, currency, timezone, active) VALUES ($1, $2, $3, $4) RETURNING *', [businessData.name, businessData.currency, businessData.timezone, true]);
                const business = businessResult.rows[0];
                // Insert owner user
                const hashedPassword = businessData.hashedPassword; // Should be pre-hashed
                const ownerName = businessData.owner_name.split(' ');
                const firstName = ownerName[0] || businessData.owner_name;
                const lastName = ownerName.slice(1).join(' ') || '';
                await client.query('INSERT INTO "user" (business_id, email, password_hash, role, first_name, last_name, active) VALUES ($1, $2, $3, $4, $5, $6, $7)', [business.id, businessData.owner_email, hashedPassword, 'owner', firstName, lastName, true]);
                await client.query('COMMIT');
                return {
                    ...business,
                    owner_name: businessData.owner_name,
                    owner_email: businessData.owner_email
                };
            }
            catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
            finally {
                client.release();
            }
        }
        else {
            // Use existing Supabase logic
            throw new Error('Supabase createBusiness not implemented in unified interface yet');
        }
    }
    async getAllBusinesses() {
        if (this.connectionType === 'postgresql') {
            const result = await this.query(`
        SELECT 
          b.*,
          u.first_name || ' ' || u.last_name as owner_name,
          u.email as owner_email
        FROM business b
        LEFT JOIN "user" u ON b.id = u.business_id AND u.role = 'owner'
        ORDER BY b.created_at DESC
      `);
            return result.rows;
        }
        else {
            // Use existing Supabase logic
            throw new Error('Supabase getAllBusinesses not implemented in unified interface yet');
        }
    }
    async getBusinessById(id) {
        if (this.connectionType === 'postgresql') {
            const result = await this.query(`
        SELECT 
          b.*,
          u.first_name || ' ' || u.last_name as owner_name,
          u.email as owner_email
        FROM business b
        LEFT JOIN "user" u ON b.id = u.business_id AND u.role = 'owner'
        WHERE b.id = $1
      `, [id]);
            return result.rows[0] || null;
        }
        else {
            throw new Error('Supabase getBusinessById not implemented in unified interface yet');
        }
    }
    async updateBusiness(id, updates) {
        if (this.connectionType === 'postgresql') {
            const setClause = [];
            const values = [];
            let paramIndex = 1;
            if (updates.name !== undefined) {
                setClause.push(`name = $${paramIndex++}`);
                values.push(updates.name);
            }
            if (updates.currency !== undefined) {
                setClause.push(`currency = $${paramIndex++}`);
                values.push(updates.currency);
            }
            if (updates.timezone !== undefined) {
                setClause.push(`timezone = $${paramIndex++}`);
                values.push(updates.timezone);
            }
            if (updates.active !== undefined) {
                setClause.push(`active = $${paramIndex++}`);
                values.push(updates.active);
            }
            setClause.push(`updated_at = NOW()`);
            values.push(id);
            const result = await this.query(`UPDATE business SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
            return result.rows[0];
        }
        else {
            throw new Error('Supabase updateBusiness not implemented in unified interface yet');
        }
    }
    async deleteBusiness(id) {
        if (this.connectionType === 'postgresql') {
            await this.query('DELETE FROM business WHERE id = $1', [id]);
        }
        else {
            throw new Error('Supabase deleteBusiness not implemented in unified interface yet');
        }
    }
    // Cleanup
    async close() {
        if (this.pool) {
            await this.pool.end();
        }
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database.js.map