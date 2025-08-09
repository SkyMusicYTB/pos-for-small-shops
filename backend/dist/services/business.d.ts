import { Business, CreateBusinessDto } from '../types';
export declare class BusinessService {
    private db;
    constructor();
    createBusiness(businessData: CreateBusinessDto): Promise<Business>;
    getAllBusinesses(): Promise<Business[]>;
    getBusinessById(id: string): Promise<Business | null>;
    updateBusiness(id: string, updates: Partial<Business>): Promise<Business>;
    updateBusinessStatus(id: string, status: 'active' | 'inactive' | 'pending'): Promise<Business>;
    deleteBusiness(id: string): Promise<void>;
    private getDemoBusinesses;
}
//# sourceMappingURL=business.d.ts.map