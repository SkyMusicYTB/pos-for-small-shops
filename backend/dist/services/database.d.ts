import { SupabaseClient } from '@supabase/supabase-js';
export declare class DatabaseService {
    private static instance;
    private supabase;
    private adminClient;
    private constructor();
    static getInstance(): DatabaseService;
    getClient(): SupabaseClient;
    getAdminClient(): SupabaseClient;
    setUserContext(userId: string): Promise<void>;
    executeAsAdmin<T>(operation: (client: SupabaseClient) => Promise<T>): Promise<T>;
    executeAsUser<T>(userId: string, operation: (client: SupabaseClient) => Promise<T>): Promise<T>;
    testConnection(): Promise<boolean>;
    executeRawSQL(query: string, params?: any[]): Promise<any>;
}
//# sourceMappingURL=database.d.ts.map