import dotenv from 'dotenv';
import { EnvironmentConfig } from '../types';

// Load environment variables
dotenv.config();

const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = process.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
};

const getEnvNumber = (name: string, defaultValue?: number): number => {
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

export const config: EnvironmentConfig = {
  PORT: getEnvNumber('PORT', 3001),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  
  // Database
  SUPABASE_URL: getEnvVar('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY'),
  
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
export const validateConfig = (): void => {
  console.log('Validating configuration...');
  
  // Check required environment variables
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];
  
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
  
  // Validate URL formats
  try {
    new URL(config.SUPABASE_URL);
  } catch {
    throw new Error('SUPABASE_URL must be a valid URL');
  }
  
  // Validate JWT secrets are not default values
  if (config.JWT_SECRET.includes('change-in-production') && config.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be changed for production');
  }
  
  if (config.JWT_REFRESH_SECRET.includes('change-in-production') && config.NODE_ENV === 'production') {
    throw new Error('JWT_REFRESH_SECRET must be changed for production');
  }
  
  console.log('Configuration validated successfully');
};

export const isDevelopment = (): boolean => config.NODE_ENV === 'development';
export const isProduction = (): boolean => config.NODE_ENV === 'production';