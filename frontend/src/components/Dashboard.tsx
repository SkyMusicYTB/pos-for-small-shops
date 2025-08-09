import {
  CurrencyDollarIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { type User } from '../types';

interface DashboardProps {
  user: User;
}

const SuperAdminDashboard = () => {
  // Real data would come from API calls
  const stats = [
    {
      name: 'Total Businesses',
      value: '0', // This should come from real API
      change: '+0%',
      changeType: 'neutral',
      icon: BuildingStorefrontIcon,
    },
    {
      name: 'Active Users',
      value: '1', // Only the super admin
      change: '+0%',
      changeType: 'neutral',
      icon: UserGroupIcon,
    },
    {
      name: 'Monthly Revenue',
      value: '$0',
      change: '+0%',
      changeType: 'neutral',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'System Health',
      value: '100%',
      change: '+0%',
      changeType: 'positive',
      icon: ChartBarIcon,
    },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Super Admin Dashboard</h1>
        <p style={{ color: '#6b7280', marginTop: '0.25rem', margin: 0 }}>Overview of all businesses and system metrics</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-content">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <stat.icon className="icon-xl" style={{ color: '#6b7280' }} />
                </div>
                <div style={{ marginLeft: '1rem', flex: 1, minWidth: 0 }}>
                  <dt style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', margin: 0 }}>{stat.name}</dt>
                  <dd style={{ display: 'flex', alignItems: 'baseline', margin: 0 }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>{stat.value}</div>
                    <div style={{ 
                      marginLeft: '0.5rem', 
                      fontSize: '0.875rem', 
                      fontWeight: '600',
                      color: stat.changeType === 'positive' ? '#16a34a' : stat.changeType === 'negative' ? '#dc2626' : '#6b7280'
                    }}>
                      {stat.change}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', margin: 0 }}>Getting Started</h3>
        </div>
        <div className="card-content">
          <div style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            <p style={{ margin: 0, marginBottom: '1rem' }}>No businesses have been created yet.</p>
            <p style={{ margin: 0 }}>Create your first business to start using the POS system.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const BusinessDashboard = ({ user }: { user: User }) => {
  // Real data would come from API calls
  const stats = [
    {
      name: "Today's Sales",
      value: '$0',
      change: '+0%',
      changeType: 'neutral',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Products Sold',
      value: '0',
      change: '+0%',
      changeType: 'neutral',
      icon: ShoppingCartIcon,
    },
    {
      name: 'Active Staff',
      value: '1',
      change: '+0%',
      changeType: 'neutral',
      icon: UserGroupIcon,
    },
    {
      name: 'Low Stock Items',
      value: '0',
      change: '+0',
      changeType: 'positive',
      icon: ExclamationTriangleIcon,
    },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
          Welcome back, {user.first_name || 'Business Owner'}!
        </h1>
        <p style={{ color: '#6b7280', marginTop: '0.25rem', margin: 0 }}>Here's what's happening with your business today</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-content">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <stat.icon className="icon-xl" style={{ color: '#6b7280' }} />
                </div>
                <div style={{ marginLeft: '1rem', flex: 1, minWidth: 0 }}>
                  <dt style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', margin: 0 }}>{stat.name}</dt>
                  <dd style={{ display: 'flex', alignItems: 'baseline', margin: 0 }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>{stat.value}</div>
                    <div style={{ 
                      marginLeft: '0.5rem', 
                      fontSize: '0.875rem', 
                      fontWeight: '600',
                      color: stat.changeType === 'positive' ? '#16a34a' : stat.changeType === 'negative' ? '#dc2626' : '#6b7280'
                    }}>
                      {stat.change}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', margin: 0 }}>Get Started</h3>
        </div>
        <div className="card-content">
          <div style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            <p style={{ margin: 0, marginBottom: '1rem' }}>Set up your inventory and start selling.</p>
            <p style={{ margin: 0 }}>Add products to your inventory to begin processing sales.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Dashboard = ({ user }: DashboardProps) => {
  if (user.role === 'super_admin') {
    return <SuperAdminDashboard />;
  }
  
  return <BusinessDashboard user={user} />;
};