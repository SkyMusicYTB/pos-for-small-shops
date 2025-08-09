import { useState, useEffect } from 'react';
import {
  PlusIcon,
  BuildingStorefrontIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';

interface Business {
  id: string;
  name: string;
  owner_name: string;
  owner_email: string;
  currency: string;
  timezone: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  monthly_revenue: string;
  staff_count: number;
}

const mockBusinesses: Business[] = [
  {
    id: '1',
    name: 'Coffee Corner',
    owner_name: 'John Smith',
    owner_email: 'john@coffeecorner.com',
    currency: 'USD',
    timezone: 'America/New_York',
    status: 'active',
    created_at: '2024-01-15',
    monthly_revenue: '$2,340',
    staff_count: 4,
  },
  {
    id: '2',
    name: 'Tech Store',
    owner_name: 'Sarah Wilson',
    owner_email: 'sarah@techstore.com',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    status: 'active',
    created_at: '2024-02-20',
    monthly_revenue: '$5,670',
    staff_count: 8,
  },
  {
    id: '3',
    name: 'Bakery Delights',
    owner_name: 'Mike Johnson',
    owner_email: 'mike@bakerydelights.com',
    currency: 'USD',
    timezone: 'America/Chicago',
    status: 'pending',
    created_at: '2024-03-01',
    monthly_revenue: '$1,230',
    staff_count: 3,
  },
];

export const BusinessManagement = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    owner_name: '',
    owner_email: '',
    currency: 'USD',
    timezone: 'America/New_York',
  });

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllBusinesses();
      if (response.success && response.data) {
        // Convert the API response to match our Business interface
        const businessesData = response.data.map((business: any) => ({
          ...business,
          owner_name: business.owner_name || 'N/A',
          owner_email: business.owner_email || 'N/A', 
          status: business.active ? 'active' : 'inactive',
          created_at: business.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          monthly_revenue: '$0', // Would come from sales data
          staff_count: 1, // Would come from user count
        }));
        setBusinesses(businessesData);
      }
    } catch (error) {
      console.error('Failed to load businesses:', error);
      // Fallback to demo data
      setBusinesses(mockBusinesses);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.createBusiness(formData);
      if (response.success) {
        await loadBusinesses(); // Reload the list
        setShowCreateModal(false);
        setFormData({
          name: '',
          owner_name: '',
          owner_email: '',
          currency: 'USD',
          timezone: 'America/New_York',
        });
      } else {
        alert('Failed to create business: ' + response.error);
      }
    } catch (error) {
      console.error('Failed to create business:', error);
      alert('Failed to create business. Please try again.');
    }
  };

  const handleStatusChange = async (businessId: string, newStatus: 'active' | 'inactive') => {
    try {
      const response = await apiService.updateBusinessStatus(businessId, newStatus);
      if (response.success) {
        await loadBusinesses(); // Reload the list
      } else {
        alert('Failed to update business status: ' + response.error);
      }
    } catch (error) {
      console.error('Failed to update business status:', error);
      alert('Failed to update business status. Please try again.');
    }
  };

  const handleDeleteBusiness = async (businessId: string) => {
    if (confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      try {
        const response = await apiService.deleteBusiness(businessId);
        if (response.success) {
          await loadBusinesses(); // Reload the list
        } else {
          alert('Failed to delete business: ' + response.error);
        }
      } catch (error) {
        console.error('Failed to delete business:', error);
        alert('Failed to delete business. Please try again.');
      }
    }
  };

  const handleViewBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setShowViewModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Management</h1>
          <p className="text-gray-600 mt-1">Create and manage businesses in your POS system</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="icon-sm" />
          Create Business
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <BuildingStorefrontIcon className="icon-xl text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Businesses</p>
                <p className="text-2xl font-bold text-gray-900">{businesses.length}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <CheckCircleIcon className="icon-xl text-success-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {businesses.filter(b => b.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <XCircleIcon className="icon-xl text-warning-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {businesses.filter(b => b.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <XCircleIcon className="icon-xl text-danger-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">
                  {businesses.filter(b => b.status === 'inactive').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">All Businesses</h3>
        </div>
        {loading ? (
          <div className="card-content">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading businesses...</p>
            </div>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Revenue</th>
                <th>Staff</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {businesses.map((business) => (
                <tr key={business.id}>
                  <td>
                    <div className="flex items-center">
                      <BuildingStorefrontIcon className="icon text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{business.name}</div>
                        <div className="text-sm text-gray-500">{business.currency} • {business.timezone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{business.owner_name}</div>
                      <div className="text-sm text-gray-500">{business.owner_email}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      business.status === 'active' ? 'badge-success' :
                      business.status === 'pending' ? 'badge-warning' :
                      'badge-danger'
                    }`}>
                      {business.status}
                    </span>
                  </td>
                  <td className="text-sm text-gray-900">
                    {business.monthly_revenue}
                  </td>
                  <td className="text-sm text-gray-900">
                    {business.staff_count}
                  </td>
                  <td className="text-sm text-gray-500">
                    {business.created_at}
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewBusiness(business)}
                        className="text-primary-600 hover:text-primary-900 p-1"
                        title="View Details"
                      >
                        <EyeIcon className="icon-sm" />
                      </button>
                      {business.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(business.id, 'active')}
                          className="text-success-600 hover:text-success-900 p-1"
                          title="Activate"
                        >
                          <CheckCircleIcon className="icon-sm" />
                        </button>
                      )}
                      {business.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(business.id, 'inactive')}
                          className="text-warning-600 hover:text-warning-900 p-1"
                          title="Deactivate"
                        >
                          <XCircleIcon className="icon-sm" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteBusiness(business.id)}
                        className="text-danger-600 hover:text-danger-900 p-1"
                        title="Delete"
                      >
                        <TrashIcon className="icon-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Create Business Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Business</h3>
              <form onSubmit={handleCreateBusiness} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="Enter business name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    className="input"
                    placeholder="Enter owner name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.owner_email}
                    onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                    className="input"
                    placeholder="Enter owner email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="input"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="input"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Business
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Business Modal */}
      {showViewModal && selectedBusiness && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Name</label>
                  <p className="text-sm text-gray-900">{selectedBusiness.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Owner</label>
                  <p className="text-sm text-gray-900">{selectedBusiness.owner_name}</p>
                  <p className="text-sm text-gray-500">{selectedBusiness.owner_email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Configuration</label>
                  <p className="text-sm text-gray-900">{selectedBusiness.currency} • {selectedBusiness.timezone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`badge ${
                    selectedBusiness.status === 'active' ? 'badge-success' :
                    selectedBusiness.status === 'pending' ? 'badge-warning' :
                    'badge-danger'
                  }`}>
                    {selectedBusiness.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monthly Revenue</label>
                  <p className="text-sm text-gray-900">{selectedBusiness.monthly_revenue}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Staff Count</label>
                  <p className="text-sm text-gray-900">{selectedBusiness.staff_count}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">{selectedBusiness.created_at}</p>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};