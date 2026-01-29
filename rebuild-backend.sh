#!/bin/bash
# Script to completely rebuild backend container and ensure clean deployment
# This fixes issues with cached images running wrong commands

set -e

echo "=========================================="
echo "Rwanda Real Estate - Backend Rebuild"
echo "=========================================="
echo ""

# Colors for output
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

# Stop backend container
print_info "Stopping backend container..."
sudo docker compose stop backend || true
print_success "Backend stopped"
echo ""

# Remove backend container
print_info "Removing backend container..."
sudo docker compose rm -f backend || true
print_success "Backend container removed"
echo ""

# Remove backend image
print_info "Removing old backend image..."
sudo docker rmi rwanda-real-estate-vps-backend 2>/dev/null || true
sudo docker rmi murugo-v2-backend 2>/dev/null || true
print_success "Old images removed"
echo ""

# Clean build cache
print_info "Cleaning Docker build cache..."
sudo docker builder prune -f
print_success "Build cache cleaned"
echo ""

# Rebuild backend image (no cache)
print_info "Rebuilding backend image from scratch..."
sudo docker compose build --no-cache backend
print_success "Backend image rebuilt"
echo ""

# Start backend container
print_info "Starting backend container..."
sudo docker compose up -d backend
print_success "Backend container started"
echo ""

# Wait for container to start
print_info "Waiting for backend to initialize (15 seconds)..."
sleep 15

# Check container status
print_info "Checking container status..."
sudo docker compose ps backend
echo ""

# Show recent logs
print_info "Recent backend logs:"
echo "=========================================="
sudo docker compose logs --tail 50 backend
echo "=========================================="
echo ""

# Check if server is running
print_info "Checking if server is responding..."
if sudo docker compose exec -T backend wget -q -O- http://localhost:5000/health 2>/dev/null | grep -q "success"; then
  print_success "Backend is running and responding to health checks!"
else
  print_error "Backend is not responding to health checks"
  print_info "Check logs with: sudo docker compose logs -f backend"
  exit 1
fi

echo ""
print_success "Backend rebuild completed successfully!"
echo ""
echo "Next steps:"
echo "1. Check logs: sudo docker compose logs -f backend"
echo "2. Test API: curl https://api.murugohomes.com/health"
echo "3. Monitor: sudo docker compose ps"
echo ""
