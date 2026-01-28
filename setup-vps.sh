#!/bin/bash
# Rwanda Real Estate Platform - VPS Initial Setup Script
# Run this script once on a fresh Ubuntu 22.04 VPS to install Docker and dependencies

set -e  # Exit on error

echo "================================================"
echo "Rwanda Real Estate Platform - VPS Setup"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  print_error "Please do not run this script as root. Run as a regular user with sudo privileges."
  exit 1
fi

print_info "This script will install Docker and Docker Compose on your VPS"
echo ""

# Update system
print_info "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y
print_success "System updated"
echo ""

# Install prerequisites
print_info "Installing prerequisites..."
sudo apt-get install -y \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  apache2-utils \
  git \
  ufw
print_success "Prerequisites installed"
echo ""

# Add Docker's official GPG key
print_info "Adding Docker repository..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
print_success "Docker repository added"
echo ""

# Install Docker
print_info "Installing Docker..."
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
print_success "Docker installed"
echo ""

# Add current user to docker group
print_info "Adding user to docker group..."
sudo usermod -aG docker $USER
print_success "User added to docker group (logout and login again to apply)"
echo ""

# Configure firewall
print_info "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
print_success "Firewall configured"
echo ""

# Enable Docker service
print_info "Enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker
print_success "Docker service enabled"
echo ""

# Verify installation
print_info "Verifying Docker installation..."
sudo docker --version
sudo docker compose version
print_success "Docker installed successfully"
echo ""

# Create swap file (if not exists) for better performance
if [ ! -f /swapfile ]; then
  print_info "Creating 2GB swap file..."
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  print_success "Swap file created"
  echo ""
fi

echo "================================================"
echo "VPS Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Logout and login again to apply docker group membership"
echo "2. Clone your repository: git clone https://github.com/Ikaze-Murugo/murugo-v2.git"
echo "3. Configure environment files:"
echo "   - Copy .env.example to .env and edit"
echo "   - Copy backend/.env.docker to backend/.env.production and edit"
echo "4. Run deployment: ./deploy.sh"
echo ""
print_info "Please logout and login again before proceeding!"
