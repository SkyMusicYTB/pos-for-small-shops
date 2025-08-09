# Windows Setup Instructions

## Quick Start

### 1. Start Supabase
Open PowerShell or Command Prompt:
```bash
supabase start
```

### 2. Setup the Project
```bash
# Option 1: Use the batch file
setup.bat

# Option 2: Manual setup
cd backend
npm install
npm run build
cd ../frontend
npm install
cd ..
```

### 3. Run Database Migrations
You'll need to run the database migrations manually:

```bash
# Connect to Supabase PostgreSQL (adjust if your connection details differ)
psql -h localhost -p 5432 -U postgres -d postgres -W

# In psql, run the migrations:
\i migrations/001_initial_schema.sql
\i migrations/002_seed_data.sql
\q
```

### 4. Start the Applications

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### 5. Access the System
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Login**: admin@example.com / Admin123!

## Troubleshooting

### If TypeScript Build Fails
The JWT library types were causing issues. This has been fixed with type casting.

If you still see TypeScript errors:
```bash
cd backend
npm run build
```

### If Backend Won't Start
1. Check if Supabase is running: `curl http://localhost:8000/health`
2. Verify environment variables in `backend/.env`
3. Make sure all dependencies are installed: `npm install`

### If Database Connection Fails
1. Ensure Supabase is running: `supabase status`
2. Check that the migrations were applied correctly
3. Verify database connection details in `.env`

## Manual Database Setup

If you need to set up the database manually:

1. **Create the schema:**
   ```bash
   psql -h localhost -p 5432 -U postgres -d postgres -f migrations/001_initial_schema.sql
   ```

2. **Add seed data:**
   ```bash
   psql -h localhost -p 5432 -U postgres -d postgres -f migrations/002_seed_data.sql
   ```

## Environment Variables

The backend `.env` file should contain:
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=http://localhost:8000
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.6NTvqm9UZ2sKxQj-J8gF8QOHKJUo-H-W8KMKWoNB
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-2024
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=Admin123!
```

## Success!

Once everything is running, you should see:
- Backend console showing "Server running on port 3001"
- Frontend accessible at http://localhost:5173
- Login page with preset credentials working

🎉 **You now have a working multi-tenant POS system!**