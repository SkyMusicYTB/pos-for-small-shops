#!/bin/bash

# Multi-tenant POS System Integration Test
# This script tests the complete system functionality

set -e

echo "🧪 Testing Multi-tenant POS System Integration"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:5173"
HEALTH_URL="$BACKEND_URL/health"
AUTH_URL="$BACKEND_URL/api/auth"

# Test credentials
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="Admin123!"

# Function to print colored output
print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    exit 1
}

print_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Test 1: Backend Health Check
test_backend_health() {
    print_test "Testing backend health endpoint..."
    
    local response=$(curl -s -w "%{http_code}" "$HEALTH_URL" -o /tmp/health_response.json)
    local status_code=${response: -3}
    
    if [ "$status_code" = "200" ]; then
        local status=$(cat /tmp/health_response.json | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        if [ "$status" = "healthy" ]; then
            print_pass "Backend health check successful"
        else
            print_fail "Backend reports unhealthy status"
        fi
    else
        print_fail "Backend health check failed (HTTP $status_code)"
    fi
}

# Test 2: Database Connection
test_database_connection() {
    print_test "Testing database connection via backend..."
    
    local response=$(curl -s -w "%{http_code}" "$HEALTH_URL" -o /tmp/db_response.json)
    local status_code=${response: -3}
    
    if [ "$status_code" = "200" ]; then
        local db_status=$(cat /tmp/db_response.json | grep -o '"database":{[^}]*}' | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        if [ "$db_status" = "healthy" ]; then
            print_pass "Database connection successful"
        else
            print_fail "Database connection failed"
        fi
    else
        print_fail "Could not check database status"
    fi
}

# Test 3: Super Admin Authentication
test_super_admin_login() {
    print_test "Testing super admin authentication..."
    
    local login_data="{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}"
    local response=$(curl -s -w "%{http_code}" -X POST "$AUTH_URL/login" \
        -H "Content-Type: application/json" \
        -d "$login_data" \
        -o /tmp/login_response.json)
    local status_code=${response: -3}
    
    if [ "$status_code" = "200" ]; then
        local success=$(cat /tmp/login_response.json | grep -o '"success":[^,]*' | cut -d':' -f2)
        if [ "$success" = "true" ]; then
            # Extract tokens for further tests
            ACCESS_TOKEN=$(cat /tmp/login_response.json | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
            REFRESH_TOKEN=$(cat /tmp/login_response.json | grep -o '"refresh_token":"[^"]*"' | cut -d'"' -f4)
            print_pass "Super admin login successful"
        else
            print_fail "Login failed - invalid response"
        fi
    else
        print_fail "Login failed (HTTP $status_code)"
    fi
}

# Test 4: Protected Endpoint Access
test_protected_endpoint() {
    print_test "Testing protected endpoint access..."
    
    if [ -z "$ACCESS_TOKEN" ]; then
        print_fail "No access token available for protected endpoint test"
    fi
    
    local response=$(curl -s -w "%{http_code}" "$AUTH_URL/profile" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -o /tmp/profile_response.json)
    local status_code=${response: -3}
    
    if [ "$status_code" = "200" ]; then
        local success=$(cat /tmp/profile_response.json | grep -o '"success":[^,]*' | cut -d':' -f2)
        if [ "$success" = "true" ]; then
            local role=$(cat /tmp/profile_response.json | grep -o '"role":"[^"]*"' | cut -d'"' -f4)
            if [ "$role" = "super_admin" ]; then
                print_pass "Protected endpoint access successful (role: $role)"
            else
                print_fail "Unexpected role: $role"
            fi
        else
            print_fail "Profile request failed"
        fi
    else
        print_fail "Protected endpoint access failed (HTTP $status_code)"
    fi
}

# Test 5: Token Refresh
test_token_refresh() {
    print_test "Testing token refresh functionality..."
    
    if [ -z "$REFRESH_TOKEN" ]; then
        print_fail "No refresh token available for refresh test"
    fi
    
    local refresh_data="{\"refresh_token\":\"$REFRESH_TOKEN\"}"
    local response=$(curl -s -w "%{http_code}" -X POST "$AUTH_URL/refresh" \
        -H "Content-Type: application/json" \
        -d "$refresh_data" \
        -o /tmp/refresh_response.json)
    local status_code=${response: -3}
    
    if [ "$status_code" = "200" ]; then
        local success=$(cat /tmp/refresh_response.json | grep -o '"success":[^,]*' | cut -d':' -f2)
        if [ "$success" = "true" ]; then
            print_pass "Token refresh successful"
        else
            print_fail "Token refresh failed - invalid response"
        fi
    else
        print_fail "Token refresh failed (HTTP $status_code)"
    fi
}

# Test 6: Frontend Accessibility
test_frontend_access() {
    print_test "Testing frontend accessibility..."
    
    local response=$(curl -s -w "%{http_code}" "$FRONTEND_URL" -o /tmp/frontend_response.html)
    local status_code=${response: -3}
    
    if [ "$status_code" = "200" ]; then
        # Check if HTML contains expected content
        if grep -q "POS System" /tmp/frontend_response.html; then
            print_pass "Frontend is accessible and contains expected content"
        else
            print_fail "Frontend accessible but missing expected content"
        fi
    else
        print_fail "Frontend not accessible (HTTP $status_code)"
    fi
}

# Test 7: CORS Configuration
test_cors_configuration() {
    print_test "Testing CORS configuration..."
    
    local response=$(curl -s -w "%{http_code}" -X OPTIONS "$AUTH_URL/login" \
        -H "Origin: http://localhost:5173" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -o /tmp/cors_response.txt)
    local status_code=${response: -3}
    
    if [ "$status_code" = "200" ] || [ "$status_code" = "204" ]; then
        print_pass "CORS configuration working"
    else
        print_fail "CORS configuration issue (HTTP $status_code)"
    fi
}

# Test 8: Database Schema Validation
test_database_schema() {
    print_test "Testing database schema (via health check)..."
    
    # This is a basic test - in a real scenario you'd check table existence
    local response=$(curl -s "$HEALTH_URL")
    if echo "$response" | grep -q "healthy"; then
        print_pass "Database schema appears to be working"
    else
        print_fail "Database schema validation failed"
    fi
}

# Main test execution
run_all_tests() {
    print_info "Starting comprehensive system integration tests..."
    echo ""
    
    # Test backend components
    test_backend_health
    test_database_connection
    test_database_schema
    
    # Test authentication flow
    test_super_admin_login
    test_protected_endpoint
    test_token_refresh
    
    # Test frontend and connectivity
    test_frontend_access
    test_cors_configuration
    
    echo ""
    print_pass "🎉 All integration tests passed successfully!"
    echo ""
    print_info "System Summary:"
    echo "  ✅ Backend API running and healthy"
    echo "  ✅ Database connected and operational"
    echo "  ✅ Authentication system working"
    echo "  ✅ JWT tokens functional"
    echo "  ✅ Frontend accessible"
    echo "  ✅ CORS properly configured"
    echo "  ✅ Super admin account ready"
    echo ""
    print_info "🚀 Your multi-tenant POS system is ready for use!"
    echo ""
    print_info "Next steps:"
    echo "  1. Access the system at: $FRONTEND_URL"
    echo "  2. Login with: $ADMIN_EMAIL / $ADMIN_PASSWORD"
    echo "  3. Create your first business and users"
    echo "  4. Start building additional modules"
    echo ""
}

# Cleanup temporary files
cleanup() {
    rm -f /tmp/health_response.json
    rm -f /tmp/db_response.json
    rm -f /tmp/login_response.json
    rm -f /tmp/profile_response.json
    rm -f /tmp/refresh_response.json
    rm -f /tmp/frontend_response.html
    rm -f /tmp/cors_response.txt
}

# Check prerequisites
check_prerequisites() {
    if ! command -v curl &> /dev/null; then
        print_fail "curl is required but not installed"
    fi
    
    if ! command -v grep &> /dev/null; then
        print_fail "grep is required but not installed"
    fi
}

# Main execution
main() {
    check_prerequisites
    
    # Wait a moment for services to be ready
    print_info "Waiting 5 seconds for services to be ready..."
    sleep 5
    
    run_all_tests
    cleanup
}

# Set up trap for cleanup
trap cleanup EXIT

# Run main function
main "$@"