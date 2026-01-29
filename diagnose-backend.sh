#!/bin/bash
# Diagnostic script for backend container issues
# Helps identify what command the container is actually running

echo "=========================================="
echo "Rwanda Real Estate - Backend Diagnostics"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_section() {
  echo -e "${GREEN}$1${NC}"
  echo "=========================================="
}

print_info() {
  echo -e "${YELLOW}$1${NC}"
}

print_section "1. Container Status"
sudo docker compose ps backend
echo ""

print_section "2. Container Inspect (Command)"
sudo docker inspect rwanda-backend --format='{{.Config.Cmd}}' 2>/dev/null || echo "Container not found"
echo ""

print_section "3. Container Inspect (Entrypoint)"
sudo docker inspect rwanda-backend --format='{{.Config.Entrypoint}}' 2>/dev/null || echo "Container not found"
echo ""

print_section "4. Running Processes Inside Container"
sudo docker compose exec backend ps aux 2>/dev/null || echo "Container not running"
echo ""

print_section "5. Recent Logs (Last 30 lines)"
sudo docker compose logs --tail 30 backend
echo ""

print_section "6. Docker Compose Configuration"
sudo docker compose config | grep -A 20 "backend:"
echo ""

print_section "7. Backend Image Details"
sudo docker images | grep -E "backend|REPOSITORY"
echo ""

print_section "8. Check for Override Files"
ls -la docker-compose*.yml
echo ""

print_section "9. Environment Variables in Container"
sudo docker compose exec backend env | grep -E "NODE_ENV|PORT|DB_HOST|REDIS_HOST" 2>/dev/null || echo "Container not running"
echo ""

print_section "10. Health Check Status"
sudo docker inspect rwanda-backend --format='{{.State.Health.Status}}' 2>/dev/null || echo "Container not found"
echo ""

print_info "Diagnostic complete. Look for:"
echo "- Command should be: [node dist/server.js]"
echo "- Logs should show: 'Server running on port 5000'"
echo "- Processes should show: 'node dist/server.js' (not migration script)"
echo ""
