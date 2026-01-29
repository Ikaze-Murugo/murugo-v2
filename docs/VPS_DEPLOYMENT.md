# VPS Deployment Guide with Domain Setup

Complete guide for deploying the Rwanda Real Estate Platform on a VPS with your custom domain, SSL certificates, and Docker.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [VPS Selection & Setup](#vps-selection--setup)
3. [Domain DNS Configuration](#domain-dns-configuration)
4. [Initial VPS Setup](#initial-vps-setup)
5. [Deploy Application](#deploy-application)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Maintenance & Updates](#maintenance--updates)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **VPS** with Ubuntu 22.04 LTS (or 20.04)
- **Domain name** (e.g., `yourdomain.com`)
- **SSH access** to your VPS
- **GitHub account** (or Git repository access)
- **API keys** ready:
  - Cloudinary (for image uploads)
  - SendGrid (for emails)
  - Twilio (for SMS)
  - Google Maps API

**Recommended VPS specs:**
- **Minimum:** 2 CPU cores, 2GB RAM, 20GB storage
- **Recommended:** 2-4 CPU cores, 4GB RAM, 40GB+ storage
- **Providers:** DigitalOcean, Hetzner, Linode, Vultr, AWS Lightsail

---

## VPS Selection & Setup

### Step 1: Choose VPS Provider

**Popular options:**

| Provider | Starting Price | Best For |
|----------|----------------|----------|
| **DigitalOcean** | $6/mo (1GB) | Easy setup, good docs |
| **Hetzner** | €4.15/mo (2GB) | Best value in Europe |
| **Linode** | $5/mo (1GB) | Good performance |
| **Vultr** | $6/mo (1GB) | Global locations |
| **AWS Lightsail** | $5/mo (1GB) | AWS ecosystem |

**Recommendation:** For Rwanda, choose a **European region** (Frankfurt, Amsterdam) for lower latency.

### Step 2: Create VPS Instance

1. **Create account** on your chosen provider
2. **Create new instance:**
   - OS: **Ubuntu 22.04 LTS**
   - Plan: **2GB RAM / 1-2 vCPU** minimum
   - Region: **Europe** (closest to Rwanda)
   - Add **SSH key** (or set password)
3. **Note your VPS IP address** (e.g., `123.45.67.89`)

### Step 3: Connect to VPS

```bash
# Replace with your VPS IP and username
ssh root@123.45.67.89
# or
ssh ubuntu@123.45.67.89
```

---

## Domain DNS Configuration

### Step 1: Get Your VPS IP Address

From your VPS provider dashboard, note the **public IP address** (e.g., `123.45.67.89`).

### Step 2: Configure DNS Records

Go to your **domain registrar** (e.g., Namecheap, GoDaddy, Cloudflare) and add these DNS records:

#### Option A: Using Subdomain for API (Recommended)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| **A** | `api` | `123.45.67.89` | 300 (or Auto) |
| **A** | `@` | `123.45.67.89` | 300 (or Auto) |
| **A** | `www` | `123.45.67.89` | 300 (or Auto) |

**Result:**
- API: `https://api.yourdomain.com`
- Main site: `https://yourdomain.com` (if you deploy frontend later)

#### Option B: Using Root Domain for API

| Type | Name | Value | TTL |
|------|------|-------|-----|
| **A** | `@` | `123.45.67.89` | 300 (or Auto) |
| **A** | `www` | `123.45.67.89` | 300 (or Auto) |

**Result:**
- API: `https://yourdomain.com`

**Note:** If using Cloudflare, set **Proxy status** to **DNS only** (gray cloud) initially, or enable **Full (strict) SSL** after SSL is set up.

### Step 3: Verify DNS Propagation

Wait 5-30 minutes, then verify:

```bash
# Check if DNS is pointing to your VPS
dig api.yourdomain.com +short
# Should return: 123.45.67.89

# Or use online tool:
# https://dnschecker.org
```

---

## Initial VPS Setup

### Step 1: Run Setup Script

On your VPS, clone the repository and run the setup script:

```bash
# Clone repository
git clone https://github.com/yourusername/rwanda-real-estate-app.git
cd rwanda-real-estate-app

# Make scripts executable
chmod +x setup-vps.sh deploy.sh

# Run initial setup (installs Docker, configures firewall)
./setup-vps.sh
```

**What this does:**
- Updates system packages
- Installs Docker and Docker Compose
- Configures firewall (ports 22, 80, 443)
- Creates swap file (2GB)
- Adds your user to docker group

**Important:** After setup, **logout and login again** to apply docker group membership.

### Step 2: Configure Environment Files

#### Root `.env` file (for Docker Compose)

```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env
```

**Required values:**

```bash
# Your domain (without https://)
DOMAIN=yourdomain.com

# Email for Let's Encrypt SSL certificates
ACME_EMAIL=admin@yourdomain.com

# Database password (generate strong password)
POSTGRES_PASSWORD=your_secure_password_here

# Traefik dashboard password (generate with: htpasswd -nb admin yourpassword)
TRAEFIK_DASHBOARD_AUTH=admin:$$apr1$$xyz$$abc123
```

**Generate Traefik dashboard password:**

```bash
# Install apache2-utils if not installed
sudo apt-get install apache2-utils

# Generate password hash
htpasswd -nb admin yourpassword
# Output: admin:$apr1$xyz$abc123
# Copy the entire output to TRAEFIK_DASHBOARD_AUTH
```

#### Backend `.env.production` file

```bash
# Copy template
cp backend/.env.docker backend/.env.production

# Edit with your values
nano backend/.env.production
```

**Required values:**

```bash
NODE_ENV=production
PORT=5000

# API URL (use your domain)
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Database (Docker internal - use service names)
DB_HOST=db
DB_PORT=5432
DB_NAME=rwanda_real_estate
DB_USER=rwanda_user
DB_PASSWORD=your_secure_password_here  # Same as POSTGRES_PASSWORD in .env
DB_SSL=false  # Internal Docker network, no SSL needed

# Redis (Docker internal)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Secrets (CRITICAL - Generate strong random keys)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_64_character_random_string_here
JWT_REFRESH_SECRET=different_64_character_random_string_here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Cloudinary (Sign up at cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SendGrid (Sign up at sendgrid.com)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Rwanda Real Estate

# Twilio (Sign up at twilio.com)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# CORS (your domain)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
MAX_FILES_PER_PROPERTY=20
```

**Generate JWT secrets:**

```bash
# On your local machine or VPS (if Node.js installed)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Run twice to get two different secrets
```

---

## Deploy Application

### Step 1: Deploy with Script

```bash
# Make sure you're in the project directory
cd rwanda-real-estate-app

# Run deployment script
./deploy.sh
```

**What this does:**
- Builds Docker images
- Starts all services (Traefik, PostgreSQL, Redis, Backend)
- Waits for services to be healthy
- Runs database migrations
- Displays service status

### Step 2: Verify Services

```bash
# Check service status
sudo docker compose ps

# View logs
sudo docker compose logs -f

# Check backend logs specifically
sudo docker compose logs -f backend
```

**Expected output:** All services should show `healthy` or `running`.

### Step 3: Check SSL Certificate

Traefik automatically requests SSL certificates from Let's Encrypt. Check logs:

```bash
sudo docker compose logs traefik | grep -i certificate
```

**First-time setup:** It may take 1-2 minutes for the certificate to be issued.

---

## Post-Deployment Verification

### Step 1: Test API Health

```bash
# From your local machine
curl https://api.yourdomain.com/health

# Expected response:
# {"status":"success","message":"Server is running","timestamp":"..."}
```

### Step 2: Test API Endpoints

```bash
# Test properties endpoint
curl https://api.yourdomain.com/api/v1/properties

# Should return empty array or properties list
```

### Step 3: Verify SSL Certificate

Visit in browser:
- `https://api.yourdomain.com/health`
- Should show **valid SSL certificate** (green lock icon)

### Step 4: Test Database Connection

```bash
# Connect to database
sudo docker compose exec db psql -U rwanda_user -d rwanda_real_estate

# Check tables
\dt

# Exit
\q
```

### Step 5: Update Mobile App Configuration

Update `mobile/.env`:

```bash
API_URL=https://api.yourdomain.com/api/v1
SOCKET_URL=https://api.yourdomain.com
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
APP_ENV=production
```

---

## Maintenance & Updates

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
sudo docker compose build
sudo docker compose up -d

# Run migrations if needed
sudo docker compose exec backend npm run migrate
```

### View Logs

```bash
# All services
sudo docker compose logs -f

# Specific service
sudo docker compose logs -f backend
sudo docker compose logs -f traefik
```

### Backup Database

```bash
# Create backup
sudo docker compose exec -T db pg_dump -U rwanda_user rwanda_real_estate > backup_$(date +%Y%m%d).sql

# Or use Makefile
make backup
```

### Restart Services

```bash
# Restart all
sudo docker compose restart

# Restart specific service
sudo docker compose restart backend
```

### Access Traefik Dashboard

Visit: `https://traefik.yourdomain.com`

Login with credentials from `.env` (`TRAEFIK_DASHBOARD_AUTH`).

---

## Troubleshooting

### SSL Certificate Not Issued

**Symptoms:** Browser shows "Not Secure" or certificate error.

**Solutions:**

1. **Check DNS propagation:**
   ```bash
   dig api.yourdomain.com
   # Should return your VPS IP
   ```

2. **Check Traefik logs:**
   ```bash
   sudo docker compose logs traefik | grep -i acme
   ```

3. **Verify ports are open:**
   ```bash
   sudo ufw status
   # Should show 80 and 443 open
   ```

4. **Check domain in docker-compose.yml:**
   - Ensure `DOMAIN` in `.env` matches your actual domain
   - Ensure Traefik labels use `api.${DOMAIN}`

5. **Wait 5-10 minutes** for Let's Encrypt rate limits (if you tried multiple times)

### Backend Not Starting

**Symptoms:** `sudo docker compose ps` shows backend as `unhealthy` or `restarting`.

**Solutions:**

1. **Check backend logs:**
   ```bash
   sudo docker compose logs backend
   ```

2. **Verify environment variables:**
   ```bash
   sudo docker compose exec backend env | grep DB_
   ```

3. **Check database connection:**
   ```bash
   sudo docker compose exec db psql -U rwanda_user -d rwanda_real_estate -c "SELECT 1;"
   ```

4. **Verify JWT secrets are set:**
   ```bash
   sudo docker compose exec backend env | grep JWT_SECRET
   ```

### Backend runs migration then restarts (never starts server)

**Symptoms:** `sudo docker compose ps` shows backend as `Restarting (0)`; logs show only "Migration complete", "Tables created/updated successfully", "Database connection established" in a loop. No "Server running on port 5000".

**Cause:** The container is running the migration script (which exits with code 0) instead of the API server. This usually means the VPS has an old `docker-compose.yml` or an old image without the correct `command`.

**Solutions:**

1. **On the VPS, ensure you have the latest code:**
   ```bash
   cd ~/murugo-v2   # or your project directory
   git pull origin main
   ```

2. **Confirm the backend service has the correct command** in `docker-compose.yml`:
   ```bash
   grep -A2 "backend:" docker-compose.yml
   # Should show: command: ["node", "dist/server.js"]
   ```
   If you see `command: ["npm", "run", "migrate"]` or no `command` and the container still runs migration, continue below.

3. **Rebuild the backend image (no cache) and recreate the container:**
   ```bash
   sudo docker compose build --no-cache backend
   sudo docker compose up -d --force-recreate backend
   ```

4. **Check that the server is running:**
   ```bash
   sudo docker compose logs --tail 20 backend
   ```
   You should see "Server running on port 5000" and no repeated "Migration complete". Then:
   ```bash
   curl -s https://api.murugohomes.com/health
   ```
   Should return JSON with `"status":"ok"`.

**Note:** Run migrations once manually when needed:  
`sudo docker compose run --rm backend npm run migrate`

### Database Connection Errors

**Symptoms:** Backend logs show "Error connecting to database".

**Solutions:**

1. **Check database is running:**
   ```bash
   sudo docker compose ps db
   ```

2. **Verify password matches:**
   - `.env` → `POSTGRES_PASSWORD`
   - `backend/.env.production` → `DB_PASSWORD`
   - Must be the same

3. **Check database health:**
   ```bash
   sudo docker compose exec db pg_isready -U rwanda_user
   ```

### DNS Not Resolving

**Symptoms:** `curl https://api.yourdomain.com` times out or "could not resolve host".

**Solutions:**

1. **Check DNS records:**
   - Use [dnschecker.org](https://dnschecker.org) to verify globally
   - Ensure A record points to your VPS IP

2. **Wait for propagation:**
   - Can take up to 48 hours (usually 5-30 minutes)

3. **Check firewall:**
   ```bash
   sudo ufw status
   # Should allow 80 and 443
   ```

### Port Already in Use

**Symptoms:** Docker Compose fails with "port already in use".

**Solutions:**

1. **Check what's using the port:**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   ```

2. **Stop conflicting service:**
   ```bash
   # If Apache/Nginx is running
   sudo systemctl stop apache2
   sudo systemctl stop nginx
   ```

3. **Or change Traefik ports** in `docker-compose.yml` (not recommended)

### High Memory Usage

**Symptoms:** VPS becomes slow, services restart.

**Solutions:**

1. **Check memory:**
   ```bash
   free -h
   ```

2. **Increase swap:**
   ```bash
   # If swap is small, increase it
   sudo fallocate -l 4G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

3. **Restart services:**
   ```bash
   sudo docker compose restart
   ```

### Can't Access Traefik Dashboard

**Symptoms:** `https://traefik.yourdomain.com` shows 404 or error.

**Solutions:**

1. **Check Traefik labels** in `docker-compose.yml`
2. **Verify `TRAEFIK_DASHBOARD_AUTH`** in `.env` is correct
3. **Check Traefik logs:**
   ```bash
   sudo docker compose logs traefik
   ```

---

## Security Checklist

- [ ] Strong database password (20+ characters, random)
- [ ] Strong JWT secrets (64+ characters, random)
- [ ] Firewall configured (only 22, 80, 443 open)
- [ ] SSL certificates working (HTTPS only)
- [ ] Traefik dashboard password set
- [ ] Environment files not committed to Git (in `.gitignore`)
- [ ] Regular database backups scheduled
- [ ] VPS OS updated regularly (`sudo apt update && sudo apt upgrade`)

---

## Cost Estimate

**Monthly costs:**

- **VPS:** $5-12/month (2GB RAM, 1-2 vCPU)
- **Domain:** $10-15/year (~$1/month)
- **Cloudinary:** Free tier (25GB storage)
- **SendGrid:** Free tier (100 emails/day)
- **Twilio:** Pay-as-you-go (or free trial)
- **Google Maps:** Free tier (first $200/month)

**Total:** ~$6-13/month for MVP.

---

## Support Resources

- **Docker Compose docs:** https://docs.docker.com/compose/
- **Traefik docs:** https://doc.traefik.io/traefik/
- **Let's Encrypt:** https://letsencrypt.org/docs/
- **PostgreSQL docs:** https://www.postgresql.org/docs/

---

**Last Updated:** January 2025  
**Version:** 1.0.0
