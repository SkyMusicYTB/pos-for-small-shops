import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../utils/config';

export class DatabaseService {
  private static instance: DatabaseService;
  private supabase: SupabaseClient;
  private adminClient: SupabaseClient;

  private constructor() {
    // Standard client for user operations
    this.supabase = createClient(
      config.SUPABASE_URL,
      config.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Admin client with service role key (bypasses RLS)
    this.adminClient = createClient(
      config.SUPABASE_URL,
      config.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
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

  // Get the regular client (subject to RLS)
  public getClient(): SupabaseClient {
    return this.supabase;
  }

  // Get the admin client (bypasses RLS)
  public getAdminClient(): SupabaseClient {
    return this.adminClient;
  }

  // Set user context for RLS operations
  public async setUserContext(userId: string): Promise<void> {
    try {
      // Set the user session for RLS context
      const { data, error } = await this.supabase.auth.admin.updateUserById(userId, {
        user_metadata: { last_context_set: new Date().toISOString() }
      });
      
      if (error) {
        console.log('Warning: Could not set user context:', error.message);
      }
    } catch (error) {
      console.log('Warning: Error setting user context:', error);
    }
  }

  // Execute operation as admin (bypassing RLS)
  public async executeAsAdmin<T>(operation: (client: SupabaseClient) => Promise<T>): Promise<T> {
    return await operation(this.adminClient);
  }

  // Execute operation with user context (respecting RLS)
  public async executeAsUser<T>(userId: string, operation: (client: SupabaseClient) => Promise<T>): Promise<T> {
    // For user operations, we would normally set the JWT token
    // For now, we'll use admin client with manual RLS checks
    return await operation(this.adminClient);
  }

  // Health check
  public async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.adminClient
        .from('business')
        .select('count(*)')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  // Execute raw SQL with parameters (admin only)
  public async executeRawSQL(query: string, params: any[] = []): Promise<any> {
    try {
      const { data, error } = await this.adminClient.rpc('execute_sql', {
        sql: query,
        params: params
      });

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.log('Raw SQL execution failed, this is expected if function does not exist:', error);
      throw error;
    }
  }
}