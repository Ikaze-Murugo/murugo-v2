# VPS Deployment - Quick Reference

Quick commands and checklist for VPS deployment with domain.

**Monitoring:** [Monitoring Cheat Sheet](./MONITORING_CHEATSHEET.md) – status, logs, SSL, DB, restart/update.

---

## Quick Setup Checklist

```bash
# 1. Connect to VPS
ssh root@YOUR_VPS_IP

# 2. Clone repository
git clone https://github.com/yourusername/rwanda-real-estate-app.git
cd rwanda-real-estate-app

# 3. Run initial setup
chmod +x setup-vps.sh deploy.sh
./setup-vps.sh

# 4. Logout and login again (to apply docker group)
exit
ssh root@YOUR_VPS_IP

# 5. Configure environment files
cp .env.example .env
cp backend/.env.docker backend/.env.production
nano .env                    # Set DOMAIN, ACME_EMAIL, POSTGRES_PASSWORD
nano backend/.env.production # Set all API keys, JWT secrets, etc.

# 6. Deploy
./deploy.sh
```

---

## DNS Configuration

**Add these A records at your domain registrar:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `api` | `YOUR_VPS_IP` | 300 |
| A | `@` | `YOUR_VPS_IP` | 300 |

**Wait 5-30 minutes for DNS propagation.**

---

## Common Commands

### Service Management

```bash
# Start all services
sudo docker compose up -d

# Stop all services
sudo docker compose down

# Restart all services
sudo docker compose restart

# Restart specific service
sudo docker compose restart backend

# View status
sudo docker compose ps
```

### Logs

```bash
# All services
sudo docker compose logs -f

# Specific service
sudo docker compose logs -f backend
sudo docker compose logs -f traefik
sudo docker compose logs -f db
```

### Database

```bash
# Run migrations
sudo docker compose exec backend npm run migrate

# Access PostgreSQL shell
sudo docker compose exec db psql -U rwanda_user -d rwanda_real_estate

# Backup database
sudo docker compose exec -T db pg_dump -U rwanda_user rwanda_real_estate > backup.sql

# Or use Makefile
make migrate
make shell-db
make backup
```

### Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
sudo docker compose build
sudo docker compose up -d

# Run migrations if needed
sudo docker compose exec backend npm run migrate
```

### Health Checks

```bash
# Test API
curl https://api.yourdomain.com/health

# Check service health
sudo docker compose ps

# Check specific service
curl -f http://localhost:5000/health
```

---

## Environment Variables Quick Reference

### Root `.env` (Docker Compose)

```bash
DOMAIN=yourdomain.com
ACME_EMAIL=admin@yourdomain.com
POSTGRES_PASSWORD=secure_password_here
TRAEFIK_DASHBOARD_AUTH=admin:$apr1$xyz$abc123
```

### Backend `.env.production`

```bash
API_URL=https://api.yourdomain.com
DB_HOST=db
DB_PASSWORD=secure_password_here  # Same as POSTGRES_PASSWORD
JWT_SECRET=64_char_random_string
JWT_REFRESH_SECRET=64_char_random_string
# ... (see full list in VPS_DEPLOYMENT.md)
```

---

## Troubleshooting Quick Fixes

### SSL Not Working

```bash
# Check DNS
dig api.yourdomain.com

# Check Traefik logs
sudo docker compose logs traefik | grep -i acme

# Restart Traefik
sudo docker compose restart traefik
```

### Backend Not Starting

```bash
# Check logs
sudo docker compose logs backend

# Verify environment
sudo docker compose exec backend env | grep DB_

# Restart
sudo docker compose restart backend
```

### Database Connection Error

```bash
# Check database is running
sudo docker compose ps db

# Test connection
sudo docker compose exec db pg_isready -U rwanda_user

# Check password matches in both .env files
```

---

## Generate Required Secrets

```bash
# JWT Secret (run twice for two different secrets)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Traefik Dashboard Password
htpasswd -nb admin yourpassword
# Copy entire output to TRAEFIK_DASHBOARD_AUTH
```

---

## Access URLs

- **API:** `https://api.yourdomain.com`
- **Health Check:** `https://api.yourdomain.com/health`
- **Traefik Dashboard:** `https://traefik.yourdomain.com`

---

## Makefile Commands

```bash
make setup          # Initial VPS setup
make deploy         # Deploy application
make start          # Start services
make stop           # Stop services
make restart        # Restart services
make logs           # View logs
make migrate        # Run migrations
make backup         # Backup database
make status         # Show status
```

---

For detailed instructions, see [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md).
