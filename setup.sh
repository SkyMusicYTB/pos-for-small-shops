#!/bin/bash

# Multi-tenant POS System Setup Script
# This script sets up the database and runs the application

set -e

echo "🚀 Setting up Multi-tenant POS System..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Supabase is running
check_supabase() {
    print_status "Checking Supabase connection..."
    
    if curl -s -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "Supabase is running on http://localhost:8000"
    else
        print_error "Supabase is not running on http://localhost:8000"
        print_warning "Please start your local Supabase instance first:"
        print_warning "  supabase start"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Check if psql is available
    if ! command -v psql &> /dev/null; then
        print_error "psql is not installed. Please install PostgreSQL client tools."
        exit 1
    fi
    
    # Database connection details for local Supabase
    DB_HOST="localhost"
    DB_PORT="5432"
    DB_NAME="postgres"
    DB_USER="postgres"
    DB_PASSWORD="postgres"
    
    # Run migrations
    print_status "Applying schema migration..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/001_initial_schema.sql
    
    print_status "Applying seed data..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/002_seed_data.sql
    
    print_success "Database migrations completed successfully!"
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing backend dependencies..."
        npm install
    fi
    
    # Build TypeScript
    print_status "Building backend..."
    npm run build
    
    cd ..
    print_success "Backend setup completed!"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    cd ..
    print_success "Frontend setup completed!"
}

# Start the applications
start_applications() {
    print_status "Starting applications..."
    
    # Function to handle cleanup on script exit
    cleanup() {
        print_warning "Shutting down applications..."
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
        exit 0
    }
    
    # Set up trap to cleanup on script exit
    trap cleanup SIGINT SIGTERM EXIT
    
    # Start backend
    print_status "Starting backend server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait a moment for backend to start
    sleep 3
    
    # Start frontend
    print_status "Starting frontend development server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Wait a moment for frontend to start
    sleep 3
    
    print_success "Applications started successfully!"
    echo ""
    echo "🎉 Multi-tenant POS System is now running!"
    echo "========================================"
    echo ""
    echo "📱 Frontend: http://localhost:5173"
    echo "🔧 Backend:  http://localhost:3001"
    echo "🔍 Health:   http://localhost:3001/health"
    echo ""
    echo "📝 Default Super Admin Credentials:"
    echo "   Email:    admin@example.com"
    echo "   Password: Admin123!"
    echo ""
    echo "💡 The system includes:"
    echo "   • Multi-tenant database with RLS policies"
    echo "   • JWT authentication with refresh tokens"
    echo "   • Role-based access control"
    echo "   • Secure API endpoints"
    echo ""
    echo "Press Ctrl+C to stop all services"
    echo ""
    
    # Wait for user to stop the script
    wait
}

# Main execution
main() {
    # Check if we're in the right directory
    if [ ! -f "setup.sh" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Check Supabase connection
    check_supabase
    
    # Run migrations
    run_migrations
    
    # Setup backend and frontend
    setup_backend
    setup_frontend
    
    # Start applications
    start_applications
}

# Run main function
main "$@"