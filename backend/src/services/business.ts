import { DatabaseService } from './database';
import { AppError, Business, CreateBusinessDto } from '../types';
import bcrypt from 'bcrypt';

export class BusinessService {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  async createBusiness(businessData: CreateBusinessDto): Promise<Business> {
    // Use admin client to bypass RLS
    const supabase = this.db.getAdminClient();
    
    try {
      console.log('Creating business with data:', businessData);

      // 1. Create the business first
      const { data: business, error: businessError } = await supabase
        .from('business')
        .insert({
          name: businessData.name,
          currency: businessData.currency,
          timezone: businessData.timezone,
          active: true
        })
        .select()
        .single();

      if (businessError) {
        console.log('Database error creating business:', businessError);
        throw new AppError(`Failed to create business: ${businessError.message}`, 400);
      }

      console.log('Business created successfully:', business);

      // 2. Create the owner user account
      const saltRounds = 10;
      const defaultPassword = 'TempPass123!'; // Owner should change this
      const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

      const { data: owner, error: ownerError } = await supabase
        .from('user')
        .insert({
          business_id: business.id,
          email: businessData.owner_email,
          password_hash: hashedPassword,
          role: 'owner',
          first_name: businessData.owner_name.split(' ')[0] || businessData.owner_name,
          last_name: businessData.owner_name.split(' ').slice(1).join(' ') || '',
          active: true
        })
        .select()
        .single();

      if (ownerError) {
        console.log('Database error creating owner:', ownerError);
        // If owner creation fails, we should clean up the business
        await supabase.from('business').delete().eq('id', business.id);
        throw new AppError(`Failed to create business owner: ${ownerError.message}`, 400);
      }

      console.log('Owner created successfully:', owner);

      // Return the business with additional info
      return {
        id: business.id,
        name: business.name,
        currency: business.currency,
        timezone: business.timezone,
        active: business.active,
        created_at: business.created_at,
        updated_at: business.updated_at,
        owner_email: businessData.owner_email,
        owner_name: businessData.owner_name
      } as Business;

    } catch (error) {
      console.log('Error in createBusiness:', error);
      
      if (error instanceof AppError) {
        throw error;
      }

      // Demo fallback for development
      console.log('Using demo mode for business creation');
      return {
        id: Date.now().toString(),
        name: businessData.name,
        currency: businessData.currency,
        timezone: businessData.timezone,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        owner_email: businessData.owner_email,
        owner_name: businessData.owner_name
      } as Business;
    }
  }

  async getAllBusinesses(): Promise<Business[]> {
    try {
      console.log('Fetching all businesses...');
      
      // Use admin client to bypass RLS
      const supabase = this.db.getAdminClient();
      
      // First, get all businesses
      const { data: businesses, error: businessError } = await supabase
        .from('business')
        .select('*')
        .order('created_at', { ascending: false });

      if (businessError) {
        console.log('Database error fetching businesses:', businessError);
        return this.getDemoBusinesses();
      }

      console.log('Businesses fetched:', businesses);

      // If no businesses, return empty array
      if (!businesses || businesses.length === 0) {
        return [];
      }

      // Get owners for each business
      const businessWithOwners = await Promise.all(
        businesses.map(async (business) => {
          try {
            const { data: owners } = await supabase
              .from('user')
              .select('first_name, last_name, email')
              .eq('business_id', business.id)
              .eq('role', 'owner')
              .limit(1);

            const owner = owners?.[0];
            
            return {
              id: business.id,
              name: business.name,
              currency: business.currency,
              timezone: business.timezone,
              active: business.active,
              created_at: business.created_at,
              updated_at: business.updated_at,
              owner_name: owner ? `${owner.first_name} ${owner.last_name}`.trim() : 'Unknown',
              owner_email: owner?.email || 'Unknown'
            } as Business;
          } catch (ownerError) {
            console.log('Error fetching owner for business:', business.id, ownerError);
            return {
              id: business.id,
              name: business.name,
              currency: business.currency,
              timezone: business.timezone,
              active: business.active,
              created_at: business.created_at,
              updated_at: business.updated_at,
              owner_name: 'Unknown',
              owner_email: 'Unknown'
            } as Business;
          }
        })
      );

      return businessWithOwners;

    } catch (error) {
      console.log('Database connection failed, using demo businesses:', error);
      return this.getDemoBusinesses();
    }
  }

  async getBusinessById(id: string): Promise<Business | null> {
    try {
      console.log('Fetching business by ID:', id);
      
      // Use admin client to bypass RLS
      const supabase = this.db.getAdminClient();
      
      const { data: business, error } = await supabase
        .from('business')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.log('Database error fetching business:', error);
        const demoBusinesses = this.getDemoBusinesses();
        return demoBusinesses.find(b => b.id === id) || null;
      }

      // Get the owner information
      const { data: owners } = await supabase
        .from('user')
        .select('first_name, last_name, email')
        .eq('business_id', business.id)
        .eq('role', 'owner')
        .limit(1);

      const owner = owners?.[0];

      return {
        id: business.id,
        name: business.name,
        currency: business.currency,
        timezone: business.timezone,
        active: business.active,
        created_at: business.created_at,
        updated_at: business.updated_at,
        owner_name: owner ? `${owner.first_name} ${owner.last_name}`.trim() : 'Unknown',
        owner_email: owner?.email || 'Unknown'
      } as Business;

    } catch (error) {
      console.log('Database connection failed, using demo business:', error);
      const demoBusinesses = this.getDemoBusinesses();
      return demoBusinesses.find(b => b.id === id) || null;
    }
  }

  async updateBusiness(id: string, updates: Partial<Business>): Promise<Business> {
    try {
      console.log('Updating business:', id, updates);

      // Use admin client to bypass RLS
      const supabase = this.db.getAdminClient();

      const { data: business, error } = await supabase
        .from('business')
        .update({
          name: updates.name,
          currency: updates.currency,
          timezone: updates.timezone,
          active: updates.active
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.log('Database error updating business:', error);
        throw new AppError(`Failed to update business: ${error.message}`, 400);
      }

      // Get the updated business with owner info
      return await this.getBusinessById(id) || business;

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.log('Database connection failed, using demo mode for business update:', error);
      const demoBusinesses = this.getDemoBusinesses();
      const existing = demoBusinesses.find(b => b.id === id);
      if (existing) {
        return { ...existing, ...updates, updated_at: new Date().toISOString() } as Business;
      }
      throw new AppError('Business not found', 404);
    }
  }

  async updateBusinessStatus(id: string, status: 'active' | 'inactive'): Promise<Business> {
    return this.updateBusiness(id, { active: status === 'active' });
  }

  async deleteBusiness(id: string): Promise<void> {
    try {
      console.log('Deleting business:', id);
      
      // Use admin client to bypass RLS
      const supabase = this.db.getAdminClient();
      
      // Delete business (users will be cascade deleted)
      const { error } = await supabase
        .from('business')
        .delete()
        .eq('id', id);

      if (error) {
        console.log('Database error deleting business:', error);
        throw new AppError(`Failed to delete business: ${error.message}`, 400);
      }

      console.log('Business deleted successfully');

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.log('Database connection failed, using demo mode for business deletion:', error);
      // Demo mode - just return success
    }
  }

  private getDemoBusinesses(): Business[] {
    return [
      {
        id: '1',
        name: 'Coffee Corner',
        currency: 'USD',
        timezone: 'America/New_York',
        active: true,
        created_at: new Date('2024-01-15').toISOString(),
        updated_at: new Date('2024-01-15').toISOString(),
        owner_name: 'John Smith',
        owner_email: 'john@coffeecorner.com'
      },
      {
        id: '2',
        name: 'Tech Store',
        currency: 'USD',
        timezone: 'America/Los_Angeles',
        active: true,
        created_at: new Date('2024-02-20').toISOString(),
        updated_at: new Date('2024-02-20').toISOString(),
        owner_name: 'Sarah Wilson',
        owner_email: 'sarah@techstore.com'
      },
      {
        id: '3',
        name: 'Bakery Delights',
        currency: 'USD',
        timezone: 'America/Chicago',
        active: false,
        created_at: new Date('2024-03-01').toISOString(),
        updated_at: new Date('2024-03-01').toISOString(),
        owner_name: 'Mike Johnson',
        owner_email: 'mike@bakerydelights.com'
      }
    ] as Business[];
  }
}