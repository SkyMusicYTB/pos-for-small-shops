import { useState } from 'react';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { type User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navigationItems = {
  super_admin: [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'businesses', name: 'Businesses', icon: BuildingStorefrontIcon },
    { id: 'users', name: 'Users', icon: UsersIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon },
  ],
  owner: [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'sales', name: 'Sales', icon: CurrencyDollarIcon },
    { id: 'inventory', name: 'Inventory', icon: CubeIcon },
    { id: 'staff', name: 'Staff', icon: UsersIcon },
    { id: 'reports', name: 'Reports', icon: ChartBarIcon },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon },
  ],
  manager: [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'sales', name: 'Sales', icon: CurrencyDollarIcon },
    { id: 'inventory', name: 'Inventory', icon: CubeIcon },
    { id: 'reports', name: 'Reports', icon: ChartBarIcon },
  ],
  cashier: [
    { id: 'sales', name: 'Sales', icon: CurrencyDollarIcon },
    { id: 'inventory', name: 'Inventory', icon: CubeIcon },
  ],
};

export const Layout = ({ children, user, onLogout, currentPage, onPageChange }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navigation = navigationItems[user.role] || [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Mobile sidebar */}
      <div style={{ display: sidebarOpen ? 'block' : 'none' }}>
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40, display: 'flex' }}>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)' }} 
            onClick={() => setSidebarOpen(false)} 
          />
          <div style={{ position: 'relative', display: 'flex', width: '100%', maxWidth: '18rem', flex: 1, flexDirection: 'column', backgroundColor: 'white' }}>
            <div style={{ position: 'absolute', top: '0.5rem', right: '-3rem' }}>
              <button
                type="button"
                style={{ 
                  marginLeft: '0.25rem', 
                  display: 'flex', 
                  height: '2.5rem', 
                  width: '2.5rem', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '50%',
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer'
                }}
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="icon" />
              </button>
            </div>
            <div style={{ display: 'flex', flexShrink: 0, alignItems: 'center', padding: '1rem' }}>
              <div style={{ height: '2rem', width: '2rem', backgroundColor: '#2563eb', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>POS</span>
              </div>
              <span style={{ marginLeft: '0.75rem', fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Point of Sale</span>
            </div>
            <nav style={{ marginTop: '0.5rem', flex: 1, height: '100%', overflowY: 'auto' }}>
              <div style={{ padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id);
                      setSidebarOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: currentPage === item.id ? '#eff6ff' : 'transparent',
                      color: currentPage === item.id ? '#1d4ed8' : '#374151',
                      borderRight: currentPage === item.id ? '2px solid #2563eb' : 'none'
                    }}
                  >
                    <item.icon 
                      className="icon" 
                      style={{ 
                        marginRight: '0.75rem',
                        color: currentPage === item.id ? '#2563eb' : '#6b7280'
                      }} 
                    />
                    {item.name}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div style={{ display: 'none', position: 'fixed', top: 0, bottom: 0, zIndex: 50, width: '16rem', flexDirection: 'column' }} className="lg:flex">
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', backgroundColor: 'white', padding: '1rem', borderRight: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', height: '3.5rem', flexShrink: 0, alignItems: 'center' }}>
            <div style={{ height: '2rem', width: '2rem', backgroundColor: '#2563eb', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>POS</span>
            </div>
            <span style={{ marginLeft: '0.75rem', fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Point of Sale</span>
          </div>
          <nav style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
            <ul style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '0.25rem', listStyle: 'none', padding: 0, margin: 0 }}>
              <li>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', listStyle: 'none', padding: 0, margin: 0 }}>
                  {navigation.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => onPageChange(item.id)}
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          borderRadius: '0.375rem',
                          padding: '0.5rem',
                          fontSize: '0.875rem',
                          lineHeight: '1.5',
                          fontWeight: '500',
                          width: '100%',
                          alignItems: 'center',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: currentPage === item.id ? '#eff6ff' : 'transparent',
                          color: currentPage === item.id ? '#1d4ed8' : '#374151',
                          borderRight: currentPage === item.id ? '2px solid #2563eb' : 'none'
                        }}
                      >
                        <item.icon 
                          className="icon" 
                          style={{ 
                            flexShrink: 0,
                            color: currentPage === item.id ? '#2563eb' : '#6b7280'
                          }} 
                        />
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div style={{ paddingLeft: '16rem' }} className="lg:pl-64">
        {/* Top navigation */}
        <div style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 40, 
          display: 'flex', 
          height: '3.5rem', 
          flexShrink: 0, 
          alignItems: 'center', 
          gap: '1rem', 
          borderBottom: '1px solid #e5e7eb', 
          backgroundColor: 'white', 
          padding: '0 1rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <button
            type="button"
            style={{ 
              margin: '-0.625rem', 
              padding: '0.625rem', 
              color: '#374151',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'block'
            }}
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="icon" />
          </button>

          <div style={{ height: '1.5rem', width: '1px', backgroundColor: '#e5e7eb' }} className="lg:hidden" />

          <div style={{ display: 'flex', flex: 1, gap: '1rem', alignSelf: 'stretch' }}>
            <div style={{ position: 'relative', display: 'flex', flex: 1, alignItems: 'center', maxWidth: '28rem' }}>
              <MagnifyingGlassIcon 
                style={{ 
                  pointerEvents: 'none', 
                  position: 'absolute', 
                  top: 0, 
                  bottom: 0, 
                  left: 0, 
                  height: '100%', 
                  width: '1rem', 
                  color: '#6b7280', 
                  paddingLeft: '0.75rem' 
                }} 
              />
              <input
                style={{ 
                  display: 'block', 
                  height: '100%', 
                  width: '100%', 
                  border: 0, 
                  padding: '0 0 0 2.5rem', 
                  fontSize: '0.875rem', 
                  color: '#111827', 
                  backgroundColor: 'transparent',
                  outline: 'none'
                }}
                placeholder="Search..."
                type="search"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                type="button" 
                style={{ 
                  margin: '-0.625rem', 
                  padding: '0.625rem', 
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <BellIcon className="icon" />
              </button>

              <div style={{ display: 'none', height: '1.5rem', width: '1px', backgroundColor: '#e5e7eb' }} className="lg:block" />

              {/* Profile dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ height: '2rem', width: '2rem', backgroundColor: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#374151' }}>
                      {user.first_name?.[0] || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: 'none' }} className="lg:block">
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', margin: 0 }}>
                      {user.first_name ? `${user.first_name} ${user.last_name}` : user.email}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, textTransform: 'capitalize' }}>{user.role.replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    fontSize: '0.875rem', 
                    color: '#374151', 
                    padding: '0.5rem 0.75rem', 
                    borderRadius: '0.375rem',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.backgroundColor = '#f3f4f6';
                    target.style.color = '#111827';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.backgroundColor = 'transparent';
                    target.style.color = '#374151';
                  }}
                >
                  <ArrowRightOnRectangleIcon className="icon-sm" />
                  <span style={{ display: 'none' }} className="sm:block">Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main style={{ padding: '1.5rem 0' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg\\:flex { display: flex !important; }
          .lg\\:hidden { display: none !important; }
          .lg\\:block { display: block !important; }
          .lg\\:pl-64 { padding-left: 16rem !important; }
        }
        
        @media (min-width: 640px) {
          .sm\\:block { display: block !important; }
        }
      `}</style>
    </div>
  );
};