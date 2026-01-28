#!/bin/bash
# Rwanda Real Estate Platform - VPS Deployment Script
# This script automates the deployment process on a fresh Ubuntu VPS

set -e  # Exit on error

echo "================================================"
echo "Rwanda Real Estate Platform - VPS Deployment"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  echo -e "${RED}Please do not run this script as root. Run as a regular user with sudo privileges.${NC}"
  exit 1
fi

# Function to print colored messages
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_info() {
  echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if .env file exists
if [ ! -f .env ]; then
  print_error ".env file not found!"
  echo "Please copy .env.example to .env and configure it first:"
  echo "  cp .env.example .env"
  echo "  nano .env"
  exit 1
fi

# Check if backend/.env.production exists
if [ ! -f backend/.env.production ]; then
  print_error "backend/.env.production file not found!"
  echo "Please copy backend/.env.docker to backend/.env.production and configure it:"
  echo "  cp backend/.env.docker backend/.env.production"
  echo "  nano backend/.env.production"
  exit 1
fi

print_info "Starting deployment..."
echo ""

# Build and start services
print_info "Building Docker images..."
sudo docker compose build --no-cache

print_success "Docker images built successfully"
echo ""

print_info "Starting services..."
sudo docker compose up -d

print_success "Services started successfully"
echo ""

# Wait for services to be healthy
print_info "Waiting for services to be healthy..."
sleep 10

# Check service health
print_info "Checking service health..."
if sudo docker compose ps | grep -q "unhealthy"; then
  print_error "Some services are unhealthy. Check logs with: sudo docker compose logs"
  exit 1
fi

print_success "All services are healthy"
echo ""

# Run database migrations
print_info "Running database migrations..."
sudo docker compose exec -T backend npm run migrate || {
  print_error "Migration failed. Check logs with: sudo docker compose logs backend"
  exit 1
}

print_success "Database migrations completed"
echo ""

# Display service status
echo "================================================"
echo "Deployment Summary"
echo "================================================"
sudo docker compose ps
echo ""

# Display URLs
source .env
echo "================================================"
echo "Access URLs"
echo "================================================"
echo "API: https://api.${DOMAIN}"
echo "Traefik Dashboard: https://traefik.${DOMAIN}"
echo ""

print_success "Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Verify API health: curl https://api.${DOMAIN}/health"
echo "2. Check logs: sudo docker compose logs -f"
echo "3. Monitor services: sudo docker compose ps"
echo ""
