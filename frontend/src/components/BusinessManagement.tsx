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
  currency: string;
  timezone: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const BusinessManagement = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      setError('');
      const response = await apiService.getAllBusinesses();
      if (response.success && response.data) {
        setBusinesses(response.data);
      } else {
        setError('Failed to load businesses from database');
        setBusinesses([]);
      }
    } catch (error) {
      console.error('Failed to load businesses:', error);
      setError('Failed to connect to database');
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.createBusiness(formData);
      if (response.success) {
        await loadBusinesses();
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
        await loadBusinesses();
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
          await loadBusinesses();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusDisplay = (active: boolean) => {
    return active ? 'active' : 'inactive';
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Business Management</h1>
          <p style={{ color: '#6b7280', marginTop: '0.25rem', margin: 0 }}>Create and manage businesses in your POS system</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <PlusIcon className="icon-sm" />
          Create Business
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-content">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <BuildingStorefrontIcon className="icon-xl" style={{ color: '#2563eb' }} />
              <div style={{ marginLeft: '1rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', margin: 0 }}>Total Businesses</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{businesses.length}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon className="icon-xl" style={{ color: '#16a34a' }} />
              <div style={{ marginLeft: '1rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', margin: 0 }}>Active</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {businesses.filter(b => b.active).length}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <XCircleIcon className="icon-xl" style={{ color: '#dc2626' }} />
              <div style={{ marginLeft: '1rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', margin: 0 }}>Inactive</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {businesses.filter(b => !b.active).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business List */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', margin: 0 }}>All Businesses</h3>
        </div>
        {loading ? (
          <div className="card-content">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ 
                width: '2rem', 
                height: '2rem', 
                border: '2px solid #e5e7eb', 
                borderTop: '2px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
              <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>Loading businesses...</p>
            </div>
          </div>
        ) : error ? (
          <div className="card-content">
            <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
              <p>{error}</p>
              <button onClick={loadBusinesses} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Retry
              </button>
            </div>
          </div>
        ) : businesses.length === 0 ? (
          <div className="card-content">
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <p>No businesses found in database.</p>
              <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Create First Business
              </button>
            </div>
          </div>
        ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((business) => (
                <tr key={business.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <BuildingStorefrontIcon className="icon" style={{ color: '#6b7280', marginRight: '0.75rem' }} />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>{business.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{business.currency} • {business.timezone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${business.active ? 'success' : 'danger'}`}>
                      {getStatusDisplay(business.active)}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {formatDate(business.created_at)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleViewBusiness(business)}
                        style={{ padding: '0.25rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
                        title="View Details"
                      >
                        <EyeIcon className="icon-sm" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(business.id, business.active ? 'inactive' : 'active')}
                        style={{ 
                          padding: '0.25rem', 
                          color: business.active ? '#dc2626' : '#16a34a', 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer' 
                        }}
                        title={business.active ? 'Deactivate' : 'Activate'}
                      >
                        {business.active ? <XCircleIcon className="icon-sm" /> : <CheckCircleIcon className="icon-sm" />}
                      </button>
                      <button
                        onClick={() => handleDeleteBusiness(business.id)}
                        style={{ padding: '0.25rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '400px',
            margin: '1rem'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '1rem' }}>Create New Business</h3>
            <form onSubmit={handleCreateBusiness} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
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
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
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
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
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
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
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
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Business Modal */}
      {showViewModal && selectedBusiness && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '400px',
            margin: '1rem'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '1rem' }}>Business Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Business Name</label>
                <p style={{ fontSize: '0.875rem', color: '#111827', margin: 0 }}>{selectedBusiness.name}</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Configuration</label>
                <p style={{ fontSize: '0.875rem', color: '#111827', margin: 0 }}>{selectedBusiness.currency} • {selectedBusiness.timezone}</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Status</label>
                <span className={`badge badge-${selectedBusiness.active ? 'success' : 'danger'}`}>
                  {getStatusDisplay(selectedBusiness.active)}
                </span>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Created</label>
                <p style={{ fontSize: '0.875rem', color: '#111827', margin: 0 }}>{formatDate(selectedBusiness.created_at)}</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Last Updated</label>
                <p style={{ fontSize: '0.875rem', color: '#111827', margin: 0 }}>{formatDate(selectedBusiness.updated_at)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                onClick={() => setShowViewModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};