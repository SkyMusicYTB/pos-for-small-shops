# Multi-Tenant POS System

A comprehensive, web-based Point of Sale system designed for small shop owners in developing countries. Features multi-tenant architecture with strict data isolation, cash-only transactions, and role-based access control.

## 🌟 Features

### Core Features (MVP)
- **Multi-Tenant Architecture**: Multiple businesses on a single instance with strict data isolation
- **Authentication & Authorization**: JWT-based auth with role hierarchy (Super Admin → Owner → Manager → Cashier)
- **Cash-Only Sales**: Simple transaction processing without payment processors
- **Inventory Management**: Product catalog with stock tracking and low-stock alerts
- **Dashboard & Reporting**: Daily sales summaries, KPIs, and analytics
- **Preset Admin Account**: Ready-to-use super admin for immediate access

### Technical Features
- **Database**: PostgreSQL with Row-Level Security (RLS) policies
- **Backend**: Node.js/Express with TypeScript
- **Frontend**: React with TypeScript and Vite
- **Security**: Bcrypt hashing, rate limiting, input validation
- **Offline-Ready**: Designed for low-connectivity environments

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL (via Supabase)
- Git

### 1. Start Supabase
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Start local Supabase instance
supabase start
```

### 2. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd pos-system

# Run the setup script (handles everything)
./setup.sh
```

The setup script will:
- ✅ Check Supabase connection
- ✅ Run database migrations
- ✅ Install dependencies
- ✅ Build the backend
- ✅ Start both backend and frontend

### 3. Access the System
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### 4. Login with Default Admin
```
Email: admin@example.com
Password: Admin123!
```

⚠️ **Change the default password after first login**

## 📊 Architecture

### Database Schema
```
business (tenant)
├── user (business_id FK)
├── product (business_id FK)
├── sale (business_id FK)
│   └── sale_item (sale_id FK)
├── audit_log (business_id FK)
└── refresh_token (user_id FK)
```

### Multi-Tenant Isolation
- **Row-Level Security (RLS)** on all tenant tables
- **Super Admin** can access all data across tenants
- **Business Users** can only access their own business data
- **JWT tokens** include business_id for context

### Role Hierarchy
1. **Super Admin**: Global access, can create/manage businesses
2. **Owner**: Full access within their business
3. **Manager**: Can manage inventory and view reports
4. **Cashier**: Can process sales and view products

## 🛠️ Manual Setup (Alternative)

If you prefer to set up manually:

### Backend Setup
```bash
cd backend
npm install
npm run build
npm run dev  # Runs on port 3001
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Runs on port 5173
```

### Database Migrations
```bash
# Connect to your Supabase PostgreSQL instance
psql -h localhost -p 5432 -U postgres -d postgres

# Run migrations
\i migrations/001_initial_schema.sql
\i migrations/002_seed_data.sql
```

## 🔧 Configuration

### Environment Variables

Backend (`.env`):
```env
# Server
PORT=3001
NODE_ENV=development

# Database (Supabase)
SUPABASE_URL=http://localhost:8000
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Default Super Admin
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=Admin123!
```

Frontend environment variables are automatically configured for local development.

## 🔐 Security Features

- **Password Hashing**: Bcrypt with configurable rounds
- **JWT Authentication**: Short-lived access tokens with refresh tokens
- **Rate Limiting**: Configurable request limits per IP
- **Input Validation**: Express-validator on all endpoints
- **SQL Injection Protection**: Parameterized queries via Supabase
- **XSS Protection**: Helmet.js security headers
- **CORS**: Configured for development and production

## 📱 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Health Check
- `GET /health` - System health status

### Example API Call
```javascript
// Login
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'Admin123!'
  })
});

const data = await response.json();
console.log(data.data.access_token);
```

## 🧪 Testing

### Test Super Admin Login
1. Start the system with `./setup.sh`
2. Navigate to http://localhost:5173
3. Use credentials: `admin@example.com` / `Admin123!`
4. Verify successful authentication

### Test Multi-Tenant Isolation
1. Create a business as super admin
2. Create owner user for that business
3. Login as owner - should only see their business data

### Test Health Check
```bash
curl http://localhost:3001/health
```

## 📋 Development Status

### ✅ Completed Features
- [x] Multi-tenant database with RLS policies
- [x] JWT authentication system
- [x] Role-based access control
- [x] Preset super-admin account
- [x] Backend API structure
- [x] Frontend authentication
- [x] Database migrations
- [x] Setup automation

### 🚧 In Progress / Planned
- [ ] Business management endpoints
- [ ] User management system
- [ ] Inventory module (products, categories)
- [ ] Sales processing
- [ ] Dashboard with KPIs
- [ ] Low-stock alerts
- [ ] Receipt generation
- [ ] Offline support
- [ ] Mobile responsiveness
- [ ] API documentation (OpenAPI)

## 🛟 Troubleshooting

### Backend Won't Start
- Check if Supabase is running: `curl http://localhost:8000/health`
- Verify environment variables in `backend/.env`
- Check logs for specific error messages

### Frontend Can't Connect
- Ensure backend is running on port 3001
- Check network connectivity
- Verify CORS configuration

### Database Issues
- Ensure Supabase is running: `supabase status`
- Check migration files were applied correctly
- Verify RLS policies are in place

### Permission Errors
- Verify user has correct role assigned
- Check JWT token is valid
- Ensure business_id matches user's business

## 🚀 Production Deployment

### Security Checklist
- [ ] Change default JWT secrets
- [ ] Update super admin password
- [ ] Configure production CORS origins
- [ ] Set up HTTPS/SSL
- [ ] Configure proper rate limiting
- [ ] Set up monitoring/logging
- [ ] Database backups

### Environment Setup
- Use production-grade PostgreSQL
- Configure environment variables
- Set up reverse proxy (nginx)
- Use process manager (PM2)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for small shop owners in developing countries
- Designed for low-connectivity environments
- Focus on simplicity and reliability
- Multi-tenant architecture for cost efficiency

---

**Built with ❤️ for small businesses worldwide**
