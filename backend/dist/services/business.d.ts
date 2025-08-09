import { Business, CreateBusinessDto, UpdateBusinessDto, CreateUserDto, User } from '../types';
export declare class BusinessService {
    private db;
    private authService;
    constructor();
    createBusiness(createBusinessDto: CreateBusinessDto): Promise<Business>;
    createBusinessWithOwner(createBusinessDto: CreateBusinessDto, ownerData: Omit<CreateUserDto, 'business_id' | 'role'>): Promise<{
        business: Business;
        owner: User;
    }>;
    getAllBusinesses(): Promise<Business[]>;
    getBusinessById(id: string): Promise<Business | null>;
    updateBusiness(id: string, updateBusinessDto: UpdateBusinessDto): Promise<Business>;
    deleteBusiness(id: string): Promise<void>;
    getBusinessUsers(businessId: string): Promise<User[]>;
    getBusinessStats(businessId: string): Promise<{
        total_users: number;
        active_users: number;
        total_products: number;
        active_products: number;
        low_stock_products: number;
        today_sales: number;
        today_transactions: number;
    }>;
    toggleBusinessStatus(id: string): Promise<Business>;
    searchBusinesses(query: string): Promise<Business[]>;
}
//# sourceMappingURL=business.d.ts.map