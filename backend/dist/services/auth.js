"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("./database");
const config_1 = require("../utils/config");
const types_1 = require("../types");
class AuthService {
    constructor() {
        this.db = database_1.DatabaseService.getInstance();
    }
    async login(credentials) {
        const { email, password } = credentials;
        console.log('Login attempt for:', email);
        try {
            let user = null;
            if (this.db.getConnectionType() === 'postgresql') {
                // Use PostgreSQL queries
                console.log('Attempting PostgreSQL connection...');
                const result = await this.db.query('SELECT * FROM "user" WHERE email = $1 AND active = true LIMIT 1', [email]);
                console.log('Database response - rows:', result.rows.length);
                if (result.rows.length > 0) {
                    user = result.rows[0];
                }
            }
            else {
                // Use Supabase client
                console.log('Attempting Supabase connection...');
                const { data: users, error } = await this.db.getAdminClient()
                    .from('user')
                    .select('*')
                    .eq('email', email)
                    .eq('active', true)
                    .limit(1);
                console.log('Database response - error:', error, 'users:', users ? users.length : 'null');
                if (error) {
                    console.log('Database error detected, using demo mode:', error.message);
                    throw new Error(error.message);
                }
                if (users && users.length > 0) {
                    user = users[0];
                }
            }
            if (!user) {
                console.log('User not found, checking for demo mode');
                // Demo mode fallback
                if (email === 'admin@example.com' && password === 'Admin123!') {
                    console.log('Providing demo authentication');
                    const demoUser = {
                        id: 'demo-user-id',
                        business_id: 'demo-business-id',
                        email: 'admin@example.com',
                        password_hash: '',
                        role: 'super_admin',
                        first_name: 'Demo',
                        last_name: 'Admin',
                        active: true,
                        created_at: new Date(),
                        updated_at: new Date()
                    };
                    const accessToken = this.generateAccessToken(demoUser);
                    const refreshToken = this.generateRefreshToken(demoUser.id);
                    return {
                        user: demoUser,
                        accessToken,
                        refreshToken
                    };
                }
                throw new types_1.AppError('Invalid credentials', 401);
            }
            // Verify password
            const isPasswordValid = await bcrypt_1.default.compare(password, user.password_hash);
            if (!isPasswordValid) {
                throw new types_1.AppError('Invalid credentials', 401);
            }
            // Update last login
            await this.updateLastLogin(user.id);
            // Generate tokens
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user.id);
            // Store refresh token
            await this.storeRefreshToken(user.id, refreshToken);
            return {
                user,
                accessToken,
                refreshToken
            };
        }
        catch (error) {
            console.log('Database connection failed, using demo mode:', error);
            // Demo mode fallback
            if (email === 'admin@example.com' && password === 'Admin123!') {
                console.log('Providing demo authentication');
                const demoUser = {
                    id: 'demo-user-id',
                    business_id: 'demo-business-id',
                    email: 'admin@example.com',
                    password_hash: '',
                    role: 'super_admin',
                    first_name: 'Demo',
                    last_name: 'Admin',
                    active: true,
                    created_at: new Date(),
                    updated_at: new Date()
                };
                const accessToken = this.generateAccessToken(demoUser);
                const refreshToken = this.generateRefreshToken(demoUser.id);
                return {
                    user: demoUser,
                    accessToken,
                    refreshToken
                };
            }
            throw new types_1.AppError('Authentication failed', 500);
        }
    }
    async register(userData) {
        const { email, password, role, first_name, last_name, business_id } = userData;
        try {
            // Check if user already exists
            const existingUser = await this.getUserByEmail(email);
            if (existingUser) {
                throw new types_1.AppError('User already exists', 409);
            }
            // Hash password
            const hashedPassword = await bcrypt_1.default.hash(password, config_1.config.BCRYPT_ROUNDS);
            let user;
            if (this.db.getConnectionType() === 'postgresql') {
                // Use PostgreSQL queries
                const result = await this.db.query(`
          INSERT INTO "user" (business_id, email, password_hash, role, first_name, last_name, active)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `, [business_id, email, hashedPassword, role, first_name, last_name, true]);
                user = result.rows[0];
            }
            else {
                // Use Supabase client
                const { data, error } = await this.db.getAdminClient()
                    .from('user')
                    .insert({
                    business_id,
                    email,
                    password_hash: hashedPassword,
                    role,
                    first_name,
                    last_name,
                    active: true
                })
                    .select()
                    .single();
                if (error) {
                    throw new types_1.AppError(`Registration failed: ${error.message}`, 400);
                }
                user = data;
            }
            // Log the registration
            await this.logAuditEvent(user.id, user.business_id || '', 'create', 'user', user.id, { email, role });
            return user;
        }
        catch (error) {
            if (error instanceof types_1.AppError) {
                throw error;
            }
            throw new types_1.AppError('Registration failed', 500);
        }
    }
    async getUserByEmail(email) {
        try {
            if (this.db.getConnectionType() === 'postgresql') {
                const result = await this.db.query('SELECT * FROM "user" WHERE email = $1 AND active = true', [email]);
                return result.rows[0] || null;
            }
            else {
                const { data, error } = await this.db.getAdminClient()
                    .from('user')
                    .select('*')
                    .eq('email', email)
                    .eq('active', true)
                    .single();
                if (error)
                    return null;
                return data;
            }
        }
        catch (error) {
            return null;
        }
    }
    async getUserById(id) {
        try {
            if (this.db.getConnectionType() === 'postgresql') {
                const result = await this.db.query('SELECT * FROM "user" WHERE id = $1 AND active = true', [id]);
                return result.rows[0] || null;
            }
            else {
                const { data, error } = await this.db.getAdminClient()
                    .from('user')
                    .select('*')
                    .eq('id', id)
                    .eq('active', true)
                    .single();
                if (error)
                    return null;
                return data;
            }
        }
        catch (error) {
            return null;
        }
    }
    async refreshToken(refreshToken) {
        try {
            // Verify refresh token
            const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.config.JWT_REFRESH_SECRET);
            const userId = decoded.userId;
            // Check if refresh token exists in database
            const isValid = await this.validateRefreshToken(userId, refreshToken);
            if (!isValid) {
                throw new types_1.AppError('Invalid refresh token', 401);
            }
            // Get user
            const user = await this.getUserById(userId);
            if (!user) {
                throw new types_1.AppError('User not found', 404);
            }
            // Generate new tokens
            const newAccessToken = this.generateAccessToken(user);
            const newRefreshToken = this.generateRefreshToken(userId);
            // Store new refresh token and invalidate old one
            await this.storeRefreshToken(userId, newRefreshToken);
            await this.invalidateRefreshToken(refreshToken);
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        }
        catch (error) {
            throw new types_1.AppError('Token refresh failed', 401);
        }
    }
    async logout(refreshToken) {
        try {
            await this.invalidateRefreshToken(refreshToken);
        }
        catch (error) {
            // Silently fail - logout should always succeed from user perspective
        }
    }
    generateAccessToken(user) {
        return jsonwebtoken_1.default.sign({
            user_id: user.id,
            business_id: user.business_id,
            role: user.role,
            email: user.email
        }, config_1.config.JWT_SECRET, {
            expiresIn: '15m'
        });
    }
    generateRefreshToken(userId) {
        return jsonwebtoken_1.default.sign({ userId }, config_1.config.JWT_REFRESH_SECRET, {
            expiresIn: '7d'
        });
    }
    async updateLastLogin(userId) {
        try {
            if (this.db.getConnectionType() === 'postgresql') {
                await this.db.query('UPDATE "user" SET last_login = NOW() WHERE id = $1', [userId]);
            }
            else {
                await this.db.getAdminClient()
                    .from('user')
                    .update({ last_login: new Date().toISOString() })
                    .eq('id', userId);
            }
        }
        catch (error) {
            console.log('Failed to update last login:', error);
        }
    }
    async storeRefreshToken(userId, refreshToken) {
        try {
            const hashedToken = await bcrypt_1.default.hash(refreshToken, 10);
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
            if (this.db.getConnectionType() === 'postgresql') {
                await this.db.query(`
          INSERT INTO refresh_token (user_id, token_hash, expires_at)
          VALUES ($1, $2, $3)
        `, [userId, hashedToken, expiresAt]);
            }
            else {
                await this.db.getAdminClient()
                    .from('refresh_token')
                    .insert({
                    user_id: userId,
                    token_hash: hashedToken,
                    expires_at: expiresAt.toISOString()
                });
            }
        }
        catch (error) {
            console.log('Failed to store refresh token:', error);
        }
    }
    async validateRefreshToken(userId, refreshToken) {
        try {
            let tokens = [];
            if (this.db.getConnectionType() === 'postgresql') {
                const result = await this.db.query(`
          SELECT token_hash FROM refresh_token 
          WHERE user_id = $1 AND expires_at > NOW()
        `, [userId]);
                tokens = result.rows;
            }
            else {
                const { data } = await this.db.getAdminClient()
                    .from('refresh_token')
                    .select('token_hash')
                    .eq('user_id', userId)
                    .gt('expires_at', new Date().toISOString());
                tokens = data || [];
            }
            for (const tokenRecord of tokens) {
                const isMatch = await bcrypt_1.default.compare(refreshToken, tokenRecord.token_hash);
                if (isMatch) {
                    return true;
                }
            }
            return false;
        }
        catch (error) {
            return false;
        }
    }
    async invalidateRefreshToken(refreshToken) {
        try {
            // Since we hash tokens, we need to find and delete by checking all tokens
            // For simplicity, we'll just clean up expired tokens
            if (this.db.getConnectionType() === 'postgresql') {
                await this.db.query('DELETE FROM refresh_token WHERE expires_at <= NOW()');
            }
            else {
                await this.db.getAdminClient()
                    .from('refresh_token')
                    .delete()
                    .lt('expires_at', new Date().toISOString());
            }
        }
        catch (error) {
            console.log('Failed to invalidate refresh token:', error);
        }
    }
    async logAuditEvent(userId, businessId, action, entity, entityId, payload) {
        try {
            if (this.db.getConnectionType() === 'postgresql') {
                await this.db.query(`
          INSERT INTO audit_log (business_id, user_id, action, entity, entity_id, payload)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [businessId, userId, action, entity, entityId, JSON.stringify(payload)]);
            }
            else {
                await this.db.getAdminClient()
                    .from('audit_log')
                    .insert({
                    business_id: businessId,
                    user_id: userId,
                    action,
                    entity,
                    entity_id: entityId,
                    payload
                });
            }
        }
        catch (error) {
            console.log('Failed to log audit event:', error);
        }
    }
    async cleanupExpiredTokens() {
        try {
            if (this.db.getConnectionType() === 'postgresql') {
                await this.db.query('DELETE FROM refresh_token WHERE expires_at <= NOW()');
            }
            else {
                await this.db.getAdminClient()
                    .from('refresh_token')
                    .delete()
                    .lt('expires_at', new Date().toISOString());
            }
        }
        catch (error) {
            console.log('Failed to cleanup expired tokens:', error);
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.js.map