"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProduction = exports.isDevelopment = exports.validateConfig = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const getEnvVar = (name, defaultValue) => {
    const value = process.env[name] || defaultValue;
    if (!value) {
        throw new Error(`Environment variable ${name} is required`);
    }
    return value;
};
const getOptionalEnvVar = (name, defaultValue) => {
    return process.env[name] || defaultValue;
};
const getEnvNumber = (name, defaultValue) => {
    const value = process.env[name];
    if (value) {
        const num = parseInt(value, 10);
        if (isNaN(num)) {
            throw new Error(`Environment variable ${name} must be a number`);
        }
        return num;
    }
    if (defaultValue !== undefined) {
        return defaultValue;
    }
    throw new Error(`Environment variable ${name} is required`);
};
exports.config = {
    PORT: getEnvNumber('PORT', 3001),
    NODE_ENV: getEnvVar('NODE_ENV', 'development'),
    // Database - support both PostgreSQL and Supabase
    DATABASE_URL: getOptionalEnvVar('DATABASE_URL'),
    SUPABASE_URL: getOptionalEnvVar('SUPABASE_URL'),
    SUPABASE_SERVICE_ROLE_KEY: getOptionalEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
    SUPABASE_ANON_KEY: getOptionalEnvVar('SUPABASE_ANON_KEY'),
    // JWT
    JWT_SECRET: getEnvVar('JWT_SECRET'),
    JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET'),
    JWT_ACCESS_EXPIRES_IN: getEnvVar('JWT_ACCESS_EXPIRES_IN', '15m'),
    JWT_REFRESH_EXPIRES_IN: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
    // Security
    BCRYPT_ROUNDS: getEnvNumber('BCRYPT_ROUNDS', 12),
    RATE_LIMIT_WINDOW_MS: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
    // Super Admin
    SUPER_ADMIN_EMAIL: getEnvVar('SUPER_ADMIN_EMAIL', 'admin@example.com'),
    SUPER_ADMIN_PASSWORD: getEnvVar('SUPER_ADMIN_PASSWORD', 'Admin123!')
};
// Validate configuration
const validateConfig = () => {
    console.log('Validating configuration...');
    // Check if we have either DATABASE_URL or Supabase config
    const hasDatabase = !!exports.config.DATABASE_URL;
    const hasSupabase = !!(exports.config.SUPABASE_URL && exports.config.SUPABASE_SERVICE_ROLE_KEY);
    if (!hasDatabase && !hasSupabase) {
        throw new Error('Either DATABASE_URL or SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY is required');
    }
    // Check required JWT variables
    const required = [
        'JWT_SECRET',
        'JWT_REFRESH_SECRET'
    ];
    for (const key of required) {
        if (!process.env[key]) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
    }
    // Validate URL formats if provided
    if (exports.config.SUPABASE_URL) {
        try {
            new URL(exports.config.SUPABASE_URL);
        }
        catch {
            throw new Error('SUPABASE_URL must be a valid URL');
        }
    }
    // Validate JWT secrets are not default values
    if (exports.config.JWT_SECRET.includes('change-in-production') && exports.config.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be changed for production');
    }
    if (exports.config.JWT_REFRESH_SECRET.includes('change-in-production') && exports.config.NODE_ENV === 'production') {
        throw new Error('JWT_REFRESH_SECRET must be changed for production');
    }
    console.log('Configuration validated successfully');
    console.log(`Database mode: ${hasDatabase ? 'PostgreSQL' : 'Supabase'}`);
};
exports.validateConfig = validateConfig;
const isDevelopment = () => exports.config.NODE_ENV === 'development';
exports.isDevelopment = isDevelopment;
const isProduction = () => exports.config.NODE_ENV === 'production';
exports.isProduction = isProduction;
//# sourceMappingURL=config.js.map