import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../utils/config';

export class DatabaseService {
  private static instance: DatabaseService;
  private supabase: SupabaseClient;

  private constructor() {
    this.supabase = createClient(
      config.SUPABASE_URL,
      config.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getClient(): SupabaseClient {
    return this.supabase;
  }

  // Set the authenticated user context for RLS
  public async setUserContext(userId: string): Promise<void> {
    await this.supabase.auth.admin.updateUserById(userId, {
      user_metadata: { last_context_set: new Date().toISOString() }
    });
  }

  // Execute raw SQL with parameters
  public async executeRawSQL(query: string, params: any[] = []): Promise<any> {
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
  public async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('business')
        .select('count')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  // Health check
  public async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    try {
      const isConnected = await this.testConnection();
      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date()
      };
    }
  }
}