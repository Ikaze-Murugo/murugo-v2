# Murugo Homes – VPS Setup (murugohomes.com)

Your domain: **murugohomes.com**  
Server IP: **72.62.212.174**

---

## 1. DNS records

Add these at your domain registrar (where you bought murugohomes.com):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| **A** | `api` | `72.62.212.174` | 300 (or Auto) |
| **A** | `@` | `72.62.212.174` | 300 (or Auto) |
| **A** | `www` | `72.62.212.174` | 300 (or Auto) |

Result:
- **API:** `https://api.murugohomes.com`
- **Traefik dashboard:** `https://traefik.murugohomes.com`
- **Main site:** `https://murugohomes.com` (when you add a frontend)

Wait 5–30 minutes, then check:

```bash
dig api.murugohomes.com +short
# Should return: 72.62.212.174
```

---

## 2. Root `.env` (Docker Compose)

Create or edit `.env` in the project root:

```bash
# Domain Configuration
DOMAIN=murugohomes.com
ACME_EMAIL=admin@murugohomes.com

# PostgreSQL Configuration
POSTGRES_DB=rwanda_real_estate
POSTGRES_USER=rwanda_user
POSTGRES_PASSWORD=YOUR_SECURE_DB_PASSWORD_HERE

# Traefik Dashboard Authentication
# Generate with: htpasswd -nb admin yourpassword
TRAEFIK_DASHBOARD_AUTH=admin:$$apr1$$xyz$$abc123
```

Replace `YOUR_SECURE_DB_PASSWORD_HERE` and `TRAEFIK_DASHBOARD_AUTH` with your real values.

---

## 3. Backend `backend/.env.production`

Create or edit `backend/.env.production`:

```bash
NODE_ENV=production
PORT=5000

# Application URLs
API_URL=https://api.murugohomes.com
FRONTEND_URL=https://murugohomes.com

# Database (Docker internal)
DB_HOST=db
DB_PORT=5432
DB_NAME=rwanda_real_estate
DB_USER=rwanda_user
DB_PASSWORD=YOUR_SECURE_DB_PASSWORD_HERE
DB_SSL=false

# Redis (Docker internal)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=YOUR_64_CHAR_SECRET
JWT_REFRESH_SECRET=YOUR_OTHER_64_CHAR_SECRET
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@murugohomes.com
FROM_NAME=Murugo Homes

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# CORS
CORS_ORIGIN=https://murugohomes.com,https://www.murugohomes.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
MAX_FILES_PER_PROPERTY=20
```

Use the same `DB_PASSWORD` as in the root `.env`. Fill in JWT secrets, Cloudinary, SendGrid, Twilio, and Google Maps with your real values.

---

## 4. Deploy on the server

```bash
# SSH into your VPS
ssh root@72.62.212.174

# Clone (if not already)
git clone https://github.com/yourusername/rwanda-real-estate-app.git
cd rwanda-real-estate-app

# One-time setup (Docker, firewall)
chmod +x setup-vps.sh deploy.sh
./setup-vps.sh

# Logout and login again, then:
cp .env.example .env
cp backend/.env.docker backend/.env.production
# Edit .env and backend/.env.production with values above

./deploy.sh
```

---

## 5. Verify

```bash
# API health
curl https://api.murugohomes.com/health

# Expected: {"status":"success","message":"Server is running",...}
```

In the mobile app `mobile/.env`:

```bash
API_URL=https://api.murugohomes.com/api/v1
SOCKET_URL=https://api.murugohomes.com
```

---

## Quick reference

| Item | Value |
|------|--------|
| Domain | murugohomes.com |
| Server IP | 72.62.212.174 |
| API URL | https://api.murugohomes.com |
| Traefik dashboard | https://traefik.murugohomes.com |

For full steps and troubleshooting, see [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md).
