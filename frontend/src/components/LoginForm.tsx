import { useState } from 'react';
import { LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import { type LoginRequest } from '../types';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [formData, setFormData] = useState<LoginRequest>({
    email: 'admin@example.com',
    password: 'Admin123!'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.login(formData);
      if (response.success) {
        onLoginSuccess();
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(to bottom right, #eff6ff, #ffffff, #eff6ff)',
      padding: '3rem 1rem'
    }}>
      <div style={{ maxWidth: '28rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            margin: '0 auto 1.5rem', 
            height: '3rem', 
            width: '3rem', 
            backgroundColor: '#2563eb', 
            borderRadius: '0.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <LockClosedIcon className="icon-lg" style={{ color: 'white' }} />
          </div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem', margin: 0 }}>Welcome back</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>Sign in to your POS account</p>
        </div>

        <div className="card">
          <div className="card-content">
            {error && (
              <div style={{ 
                marginBottom: '1rem', 
                padding: '0.75rem', 
                backgroundColor: '#fee2e2', 
                border: '1px solid #fecaca', 
                borderRadius: '0.5rem' 
              }}>
                <p style={{ fontSize: '0.875rem', color: '#991b1b', margin: 0 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label 
                  htmlFor="email" 
                  style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: '#374151', 
                    marginBottom: '0.5rem' 
                  }}
                >
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    bottom: 0, 
                    left: '0.75rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    pointerEvents: 'none' 
                  }}>
                    <UserIcon className="icon" style={{ color: '#6b7280' }} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: '#374151', 
                    marginBottom: '0.5rem' 
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    bottom: 0, 
                    left: '0.75rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    pointerEvents: 'none' 
                  }}>
                    <LockClosedIcon className="icon" style={{ color: '#6b7280' }} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      bottom: 0, 
                      right: '0.75rem', 
                      display: 'flex', 
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="icon" />
                    ) : (
                      <EyeIcon className="icon" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  fontSize: '1rem', 
                  fontWeight: '600' 
                }}
              >
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ 
                      width: '1.25rem', 
                      height: '1.25rem', 
                      border: '2px solid transparent', 
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: '0.5rem'
                    }}></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              backgroundColor: '#f9fafb', 
              borderRadius: '0.5rem' 
            }}>
              <p style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#6b7280', 
                marginBottom: '0.5rem',
                margin: 0
              }}>Demo Credentials:</p>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p style={{ margin: 0 }}><strong>Email:</strong> admin@example.com</p>
                <p style={{ margin: 0 }}><strong>Password:</strong> Admin123!</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            Multi-tenant POS System • Secure & Scalable
          </p>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};