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
  const stats = [
    {
      name: 'Total Businesses',
      value: '12',
      change: '+2.1%',
      changeType: 'positive',
      icon: BuildingStorefrontIcon,
    },
    {
      name: 'Active Users',
      value: '48',
      change: '+5.4%',
      changeType: 'positive',
      icon: UserGroupIcon,
    },
    {
      name: 'Monthly Revenue',
      value: '$24,580',
      change: '+12.5%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'System Health',
      value: '99.9%',
      change: '-0.1%',
      changeType: 'negative',
      icon: ChartBarIcon,
    },
  ];

  const recentBusinesses = [
    { name: 'Coffee Corner', owner: 'John Smith', status: 'Active', revenue: '$2,340' },
    { name: 'Tech Store', owner: 'Sarah Wilson', status: 'Active', revenue: '$5,670' },
    { name: 'Bakery Delights', owner: 'Mike Johnson', status: 'Pending', revenue: '$1,230' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of all businesses and system metrics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="icon-lg text-gray-400" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Businesses */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Businesses</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {recentBusinesses.map((business, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{business.name}</p>
                    <p className="text-sm text-gray-500">Owner: {business.owner}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{business.revenue}</p>
                    <span className={`badge ${
                      business.status === 'Active' 
                        ? 'badge-success' 
                        : 'badge-warning'
                    }`}>
                      {business.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">System Alerts</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="icon text-warning-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">High CPU Usage</p>
                  <p className="text-sm text-gray-500">Server load is at 85%</p>
                </div>
              </div>
              <div className="flex items-start">
                <ExclamationTriangleIcon className="icon text-danger-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Failed Payment</p>
                  <p className="text-sm text-gray-500">Business subscription renewal failed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BusinessDashboard = ({ user }: { user: User }) => {
  const stats = [
    {
      name: "Today's Sales",
      value: '$1,234',
      change: '+8.2%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Products Sold',
      value: '89',
      change: '+3.1%',
      changeType: 'positive',
      icon: ShoppingCartIcon,
    },
    {
      name: 'Active Staff',
      value: '6',
      change: '0%',
      changeType: 'neutral',
      icon: UserGroupIcon,
    },
    {
      name: 'Low Stock Items',
      value: '3',
      change: '+2',
      changeType: 'negative',
      icon: ExclamationTriangleIcon,
    },
  ];

  const recentSales = [
    { id: '#001', customer: 'Walk-in', amount: '$45.99', time: '2 min ago' },
    { id: '#002', customer: 'John Doe', amount: '$23.50', time: '15 min ago' },
    { id: '#003', customer: 'Walk-in', amount: '$67.25', time: '1 hour ago' },
  ];

  const lowStockItems = [
    { name: 'Coffee Beans (Dark Roast)', stock: 5, threshold: 20 },
    { name: 'Paper Cups (16oz)', stock: 12, threshold: 50 },
    { name: 'Sugar Packets', stock: 8, threshold: 100 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.first_name || 'Business Owner'}!
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your business today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="icon-lg text-gray-400" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-success-600' : 
                        stat.changeType === 'negative' ? 'text-danger-600' : 'text-gray-500'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Sales</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sale.id}</p>
                    <p className="text-sm text-gray-500">{sale.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{sale.amount}</p>
                    <p className="text-sm text-gray-500">{sale.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Low Stock Alerts</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Threshold: {item.threshold}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${
                      item.stock <= 10 ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {item.stock} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
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