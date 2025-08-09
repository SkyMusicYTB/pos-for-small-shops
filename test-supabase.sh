#!/bin/bash

echo "Testing Supabase connection on different ports..."
echo "=============================================="

# Common Supabase ports and endpoints
PORTS=(54321 8000 8080 8001 8002 3000 5432)
ENDPOINTS=("rest/v1/" "health" "")

for port in "${PORTS[@]}"; do
    echo "Testing port $port..."
    
    for endpoint in "${ENDPOINTS[@]}"; do
        url="http://localhost:$port/$endpoint"
        echo -n "  Testing $url: "
        
        if curl -s --connect-timeout 2 "$url" >/dev/null 2>&1; then
            echo "✓ RESPONDING"
            echo "    Try updating SUPABASE_URL to: http://localhost:$port"
        else
            echo "✗ No response"
        fi
    done
    echo ""
done

echo "=============================================="
echo "If any endpoints responded, update your .env file:"
echo "1. Edit /workspace/backend/.env"
echo "2. Change SUPABASE_URL to the working URL"
echo "3. Restart the backend: cd /workspace/backend && npm run dev"