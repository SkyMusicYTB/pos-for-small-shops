import { SupabaseClient } from '@supabase/supabase-js';
export declare class DatabaseService {
    private static instance;
    private supabase;
    private constructor();
    static getInstance(): DatabaseService;
    getClient(): SupabaseClient;
    setUserContext(userId: string): Promise<void>;
    executeRawSQL(query: string, params?: any[]): Promise<any>;
    testConnection(): Promise<boolean>;
    healthCheck(): Promise<{
        status: string;
        timestamp: Date;
    }>;
}
//# sourceMappingURL=database.d.ts.map