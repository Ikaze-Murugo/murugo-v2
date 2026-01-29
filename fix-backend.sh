#!/bin/bash
# Complete fix for backend container issue
# This script ensures the migration script never runs during server startup

set -e

echo "=========================================="
echo "Rwanda Real Estate - Backend Fix"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_info() {
  echo -e "${YELLOW}ℹ $1${NC}"
}

# Stop all services
print_info "Stopping all services..."
sudo docker compose down
print_success "Services stopped"
echo ""

# Remove all containers and volumes
print_info "Removing containers and volumes..."
sudo docker compose rm -f
print_success "Containers removed"
echo ""

# Remove backend images
print_info "Removing old backend images..."
sudo docker rmi rwanda-real-estate-vps-backend 2>/dev/null || true
sudo docker rmi murugo-v2-backend 2>/dev/null || true
sudo docker rmi $(sudo docker images -q --filter "reference=*backend*") 2>/dev/null || true
print_success "Old images removed"
echo ""

# Clean Docker system
print_info "Cleaning Docker system..."
sudo docker system prune -af --volumes
print_success "Docker system cleaned"
echo ""

# Rebuild all services
print_info "Rebuilding all services from scratch..."
sudo docker compose build --no-cache
print_success "Services rebuilt"
echo ""

# Start services
print_info "Starting services..."
sudo docker compose up -d
print_success "Services started"
echo ""

# Wait for services to initialize
print_info "Waiting for services to initialize (30 seconds)..."
sleep 30

# Check service status
print_info "Checking service status..."
sudo docker compose ps
echo ""

# Show backend logs
print_info "Recent backend logs:"
echo "=========================================="
sudo docker compose logs --tail 50 backend
echo "=========================================="
echo ""

# Check if migration messages appear
if sudo docker compose logs backend | grep -q "Migration complete"; then
  print_error "WARNING: Migration script is still running in server startup!"
  print_info "This should not happen. Check the logs above."
else
  print_success "Migration script is NOT running during server startup (correct!)"
fi
echo ""

# Check if server started
if sudo docker compose logs backend | grep -q "Server running on port"; then
  print_success "Server started successfully!"
else
  print_error "Server did not start. Check logs above."
  exit 1
fi
echo ""

# Test health endpoint
print_info "Testing health endpoint..."
sleep 5
if curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
  print_success "Health endpoint responding!"
  curl -s http://localhost:5000/health | jq . || curl -s http://localhost:5000/health
else
  print_error "Health endpoint not responding"
  print_info "Trying via Traefik..."
  if curl -f -s https://api.murugohomes.com/health > /dev/null 2>&1; then
    print_success "API responding via Traefik!"
    curl -s https://api.murugohomes.com/health | jq . || curl -s https://api.murugohomes.com/health
  else
    print_error "API not responding via Traefik either"
  fi
fi
echo ""

print_success "Backend fix completed!"
echo ""
echo "Next steps:"
echo "1. Run migrations: sudo docker compose exec backend npm run migrate"
echo "2. Check logs: sudo docker compose logs -f backend"
echo "3. Test API: curl https://api.murugohomes.com/health"
echo ""
