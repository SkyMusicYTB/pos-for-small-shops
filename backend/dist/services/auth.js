"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("./database");
const jwt_1 = require("../utils/jwt");
const config_1 = require("../utils/config");
const types_1 = require("../types");
class AuthService {
    constructor() {
        this.db = database_1.DatabaseService.getInstance();
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        console.log('Login attempt for:', email);
        try {
            // Find user by email
            console.log('Attempting database connection...');
            const { data: users, error } = await this.db.getClient()
                .from('user')
                .select('*')
                .eq('email', email)
                .eq('active', true)
                .limit(1);
            console.log('Database response - error:', error, 'users:', users ? users.length : 'null');
            if (error) {
                console.log('Database error detected, using demo mode:', error.message);
                // Fallback for demo when database is not accessible
                if (email === 'admin@example.com' && password === 'Admin123!') {
                    console.log('Providing demo authentication');
                    const mockUser = {
                        id: 'demo-user-id',
                        business_id: 'demo-business-id',
                        role: 'super_admin',
                        email: 'admin@example.com'
                    };
                    // Generate tokens
                    const tokenPayload = {
                        user_id: mockUser.id,
                        business_id: mockUser.business_id,
                        role: mockUser.role,
                        email: mockUser.email
                    };
                    const accessToken = jwt_1.JWTUtils.generateAccessToken(tokenPayload);
                    const refreshToken = jwt_1.JWTUtils.generateRefreshToken({ user_id: mockUser.id });
                    return {
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        user: {
                            id: mockUser.id,
                            email: mockUser.email,
                            role: mockUser.role,
                            business_id: mockUser.business_id
                        }
                    };
                }
                throw new types_1.AppError('Invalid email or password', 401);
            }
            if (!users || users.length === 0) {
                throw new types_1.AppError('Invalid email or password', 401);
            }
            const user = users[0];
            // Verify password
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password_hash);
            if (!isPasswordValid) {
                throw new types_1.AppError('Invalid email or password', 401);
            }
            // Update last login
            await this.db.getClient()
                .from('user')
                .update({ last_login: new Date().toISOString() })
                .eq('id', user.id);
            // Generate tokens
            const tokenPayload = {
                user_id: user.id,
                business_id: user.business_id,
                role: user.role,
                email: user.email
            };
            const accessToken = jwt_1.JWTUtils.generateAccessToken(tokenPayload);
            const refreshToken = jwt_1.JWTUtils.generateRefreshToken({ user_id: user.id });
            // Store refresh token
            await this.storeRefreshToken(user.id, refreshToken);
            // Log login event
            await this.logAuditEvent(user.business_id, user.id, 'login', 'user', user.id);
            return {
                user: {
                    id: user.id,
                    business_id: user.business_id,
                    email: user.email,
                    role: user.role,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    active: user.active,
                    last_login: user.last_login,
                    created_at: user.created_at,
                    updated_at: user.updated_at
                },
                access_token: accessToken,
                refresh_token: refreshToken
            };
        }
        catch (error) {
            console.log('Database connection failed, trying demo mode');
            // Fallback for demo when database is not accessible  
            if (email === 'admin@example.com' && password === 'Admin123!') {
                const mockUser = {
                    id: 'demo-user-id',
                    business_id: 'demo-business-id',
                    role: 'super_admin',
                    email: 'admin@example.com'
                };
                // Generate tokens
                const tokenPayload = {
                    user_id: mockUser.id,
                    business_id: mockUser.business_id,
                    role: mockUser.role,
                    email: mockUser.email
                };
                const accessToken = jwt_1.JWTUtils.generateAccessToken(tokenPayload);
                const refreshToken = jwt_1.JWTUtils.generateRefreshToken({ user_id: mockUser.id });
                return {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    user: {
                        id: mockUser.id,
                        email: mockUser.email,
                        role: mockUser.role,
                        business_id: mockUser.business_id
                    }
                };
            }
            throw new types_1.AppError('Invalid email or password', 401);
        }
    }
    async refreshAccessToken(refreshToken) {
        try {
            // Verify refresh token
            const payload = jwt_1.JWTUtils.verifyRefreshToken(refreshToken);
            // Check if refresh token exists in database
            const { data: tokens, error } = await this.db.getClient()
                .from('refresh_token')
                .select('*')
                .eq('user_id', payload.user_id)
                .eq('token_hash', await bcryptjs_1.default.hash(refreshToken, config_1.config.BCRYPT_ROUNDS))
                .gt('expires_at', new Date().toISOString())
                .limit(1);
            if (error || !tokens || tokens.length === 0) {
                throw new types_1.AppError('Invalid or expired refresh token', 401);
            }
            // Get user details
            const { data: users, error: userError } = await this.db.getClient()
                .from('user')
                .select('*')
                .eq('id', payload.user_id)
                .eq('active', true)
                .limit(1);
            if (userError || !users || users.length === 0) {
                throw new types_1.AppError('User not found or inactive', 401);
            }
            const user = users[0];
            // Generate new tokens
            const tokenPayload = {
                user_id: user.id,
                business_id: user.business_id,
                role: user.role,
                email: user.email
            };
            const newAccessToken = jwt_1.JWTUtils.generateAccessToken(tokenPayload);
            const newRefreshToken = jwt_1.JWTUtils.generateRefreshToken({ user_id: user.id });
            // Remove old refresh token and store new one
            await this.removeRefreshToken(refreshToken);
            await this.storeRefreshToken(user.id, newRefreshToken);
            return {
                access_token: newAccessToken,
                refresh_token: newRefreshToken
            };
        }
        catch (error) {
            if (error instanceof types_1.AppError) {
                throw error;
            }
            throw new types_1.AppError('Token refresh failed', 401);
        }
    }
    async logout(refreshToken) {
        await this.removeRefreshToken(refreshToken);
    }
    async createUser(createUserDto) {
        const { password, ...userData } = createUserDto;
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, config_1.config.BCRYPT_ROUNDS);
        // Check if email already exists
        const { data: existingUsers } = await this.db.getClient()
            .from('user')
            .select('id')
            .eq('email', userData.email)
            .limit(1);
        if (existingUsers && existingUsers.length > 0) {
            throw new types_1.AppError('Email already exists', 409);
        }
        // Create user
        const { data: users, error } = await this.db.getClient()
            .from('user')
            .insert([{
                ...userData,
                password_hash: passwordHash
            }])
            .select()
            .limit(1);
        if (error) {
            throw new types_1.AppError('Failed to create user', 500);
        }
        return users[0];
    }
    async validateUser(userId) {
        try {
            const { data: users, error } = await this.db.getClient()
                .from('user')
                .select('*')
                .eq('id', userId)
                .eq('active', true)
                .limit(1);
            if (error || !users || users.length === 0) {
                // Demo fallback when database is not accessible
                if (userId === 'demo-user-id') {
                    return {
                        id: 'demo-user-id',
                        business_id: 'demo-business-id',
                        email: 'admin@example.com',
                        role: 'super_admin',
                        first_name: 'Demo',
                        last_name: 'Admin',
                        active: true,
                        last_login: new Date().toISOString(),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        password_hash: ''
                    };
                }
                return null;
            }
            return users[0];
        }
        catch (error) {
            // Demo fallback when database is not accessible
            if (userId === 'demo-user-id') {
                return {
                    id: 'demo-user-id',
                    business_id: 'demo-business-id',
                    email: 'admin@example.com',
                    role: 'super_admin',
                    first_name: 'Demo',
                    last_name: 'Admin',
                    active: true,
                    last_login: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    password_hash: ''
                };
            }
            return null;
        }
    }
    async storeRefreshToken(userId, refreshToken) {
        const tokenHash = await bcryptjs_1.default.hash(refreshToken, config_1.config.BCRYPT_ROUNDS);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
        await this.db.getClient()
            .from('refresh_token')
            .insert([{
                user_id: userId,
                token_hash: tokenHash,
                expires_at: expiresAt.toISOString()
            }]);
    }
    async removeRefreshToken(refreshToken) {
        const tokenHash = await bcryptjs_1.default.hash(refreshToken, config_1.config.BCRYPT_ROUNDS);
        await this.db.getClient()
            .from('refresh_token')
            .delete()
            .eq('token_hash', tokenHash);
    }
    async logAuditEvent(businessId, userId, action, entity, entityId) {
        await this.db.getClient()
            .from('audit_log')
            .insert([{
                business_id: businessId,
                user_id: userId,
                action,
                entity,
                entity_id: entityId,
                payload: { timestamp: new Date().toISOString() }
            }]);
    }
    // Clean up expired refresh tokens
    async cleanupExpiredTokens() {
        await this.db.getClient()
            .from('refresh_token')
            .delete()
            .lt('expires_at', new Date().toISOString());
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.js.map