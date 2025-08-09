import { SupabaseClient } from '@supabase/supabase-js';
import { PoolClient } from 'pg';
export declare class DatabaseService {
    private static instance;
    private supabase?;
    private adminClient?;
    private pool?;
    private connectionType;
    private constructor();
    private initializePostgreSQL;
    private initializeSupabase;
    static getInstance(): DatabaseService;
    getConnectionType(): 'postgresql' | 'supabase';
    query(text: string, params?: any[]): Promise<any>;
    getClient(): Promise<PoolClient>;
    getSupabaseClient(): SupabaseClient;
    getAdminClient(): SupabaseClient;
    testConnection(): Promise<boolean>;
    createBusiness(businessData: any): Promise<any>;
    getAllBusinesses(): Promise<any[]>;
    getBusinessById(id: string): Promise<any>;
    updateBusiness(id: string, updates: any): Promise<any>;
    deleteBusiness(id: string): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=database.d.ts.map