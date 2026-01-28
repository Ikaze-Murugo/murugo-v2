.PHONY: help setup deploy start stop restart logs status clean migrate shell-backend shell-db backup restore

# Default target
help:
	@echo "Rwanda Real Estate Platform - Deployment Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  make setup          - Initial VPS setup (run once)"
	@echo "  make deploy         - Deploy the application"
	@echo "  make start          - Start all services"
	@echo "  make stop           - Stop all services"
	@echo "  make restart        - Restart all services"
	@echo "  make logs           - View logs (all services)"
	@echo "  make logs-backend   - View backend logs"
	@echo "  make logs-db        - View database logs"
	@echo "  make status         - Show service status"
	@echo "  make migrate        - Run database migrations"
	@echo "  make shell-backend  - Open shell in backend container"
	@echo "  make shell-db       - Open PostgreSQL shell"
	@echo "  make backup         - Backup database"
	@echo "  make restore        - Restore database from backup"
	@echo "  make clean          - Stop and remove all containers"
	@echo ""

# Initial VPS setup
setup:
	@./setup-vps.sh

# Deploy application
deploy:
	@./deploy.sh

# Start services
start:
	@echo "Starting services..."
	@sudo docker compose up -d
	@echo "Services started successfully"

# Stop services
stop:
	@echo "Stopping services..."
	@sudo docker compose down
	@echo "Services stopped successfully"

# Restart services
restart:
	@echo "Restarting services..."
	@sudo docker compose restart
	@echo "Services restarted successfully"

# View logs
logs:
	@sudo docker compose logs -f

logs-backend:
	@sudo docker compose logs -f backend

logs-db:
	@sudo docker compose logs -f db

logs-traefik:
	@sudo docker compose logs -f traefik

# Show service status
status:
	@sudo docker compose ps

# Run database migrations
migrate:
	@echo "Running database migrations..."
	@sudo docker compose exec backend npm run migrate
	@echo "Migrations completed successfully"

# Open shell in backend container
shell-backend:
	@sudo docker compose exec backend sh

# Open PostgreSQL shell
shell-db:
	@sudo docker compose exec db psql -U rwanda_user -d rwanda_real_estate

# Backup database
backup:
	@echo "Creating database backup..."
	@mkdir -p backups
	@sudo docker compose exec -T db pg_dump -U rwanda_user rwanda_real_estate > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup created in backups/ directory"

# Restore database from backup
restore:
	@echo "Available backups:"
	@ls -lh backups/
	@echo ""
	@read -p "Enter backup filename: " backup_file; \
	sudo docker compose exec -T db psql -U rwanda_user rwanda_real_estate < backups/$$backup_file
	@echo "Database restored successfully"

# Clean up
clean:
	@echo "Stopping and removing all containers..."
	@sudo docker compose down -v
	@echo "Cleanup completed"

# Build images
build:
	@echo "Building Docker images..."
	@sudo docker compose build --no-cache
	@echo "Build completed"

# Update application
update:
	@echo "Updating application..."
	@git pull origin main
	@sudo docker compose build
	@sudo docker compose up -d
	@sudo docker compose exec backend npm run migrate
	@echo "Update completed"

# Health check
health:
	@echo "Checking service health..."
	@curl -f http://localhost:5000/health || echo "Backend is not responding"
	@sudo docker compose ps
