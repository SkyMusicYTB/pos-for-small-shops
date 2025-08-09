import { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { BusinessManagement } from './components/BusinessManagement';
import { SalesTerminal } from './components/SalesTerminal';
import { apiService } from './services/api';
import { type User } from './types';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    checkBackendConnection();
    checkAuthStatus();
  }, []);

  const checkBackendConnection = async () => {
    try {
      await apiService.healthCheck();
      setBackendStatus('connected');
    } catch (error) {
      setBackendStatus('error');
    }
  };

  const checkAuthStatus = async () => {
    try {
      if (apiService.isAuthenticated()) {
        const response = await apiService.getProfile();
        if (response.success) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await apiService.getProfile();
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to get user profile after login:', error);
    }
  };

  const handleLogout = async () => {
    await apiService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('dashboard');
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (backendStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-danger-50 border border-danger-200 text-danger-600 px-6 py-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Backend Connection Failed</h2>
            <p className="mb-4">
              Cannot connect to the backend server. Please make sure the backend is running on port 3001.
            </p>
            <button
              onClick={checkBackendConnection}
              className="btn-danger"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginForm onLoginSuccess={handleLogin} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'businesses':
        return <BusinessManagement />;
      case 'users':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <div className="card">
              <div className="card-content">
                <p className="text-gray-500">User management features coming soon...</p>
              </div>
            </div>
          </div>
        );
      case 'sales':
        return <SalesTerminal />;
      case 'inventory':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <div className="card">
              <div className="card-content">
                <p className="text-gray-500">Inventory management features coming soon...</p>
              </div>
            </div>
          </div>
        );
      case 'staff':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            <div className="card">
              <div className="card-content">
                <p className="text-gray-500">Staff management features coming soon...</p>
              </div>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <div className="card">
              <div className="card-content">
                <p className="text-gray-500">Reports and analytics features coming soon...</p>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
            <div className="card">
              <div className="card-content">
                <p className="text-gray-500">System analytics features coming soon...</p>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <div className="card">
              <div className="card-content">
                <p className="text-gray-500">Settings features coming soon...</p>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <Layout
      user={user}
      onLogout={handleLogout}
      currentPage={currentPage}
      onPageChange={handlePageChange}
    >
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;
