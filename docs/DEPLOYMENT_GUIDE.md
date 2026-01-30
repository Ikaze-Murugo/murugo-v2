# Rwanda Real Estate Platform - Deployment Guide

## Table of Contents

1. [Overview](#overview)
2. [Free Hosting Options](#free-hosting-options)
3. [Backend Deployment](#backend-deployment)
4. [Mobile App Deployment](#mobile-app-deployment)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Post-Deployment Checks](#post-deployment-checks)

## Overview

This guide provides step-by-step instructions for deploying the Rwanda Real Estate Platform using free or low-cost hosting services. The platform consists of a Node.js backend API and a React Native mobile application.

## Free Hosting Options

### Backend API Hosting

**Option 1: Render.com (Recommended for MVP)**
- Free tier includes 750 hours/month
- Automatic deployments from Git
- Built-in PostgreSQL database (90-day limit on free tier)
- SSL certificates included
- Custom domains supported

**Option 2: Railway.app**
- $5 free credit monthly
- PostgreSQL and Redis included
- GitHub integration
- Automatic deployments

**Option 3: VPS with Docker (Recommended for Production)**
- Full control, Socket.io/Redis support, custom domain with SSL
- One-time setup, predictable costs (~$6-12/month)
- See [VPS deployment guide with domain setup](./VPS_DEPLOYMENT.md)
- [Monitoring cheat sheet](./MONITORING_CHEATSHEET.md) – status, logs, SSL, DB, restart/update

**Option 4: Vercel + Supabase**
- Serverless API on Vercel; PostgreSQL on Supabase (free tiers)
- No Redis/Socket.io on Vercel; use Supabase Realtime or polling for real-time
- See [Vercel + Supabase deployment guide](./VERCEL_SUPABASE_DEPLOYMENT.md)

**Option 5: Fly.io**
- Free tier with 3 shared VMs
- PostgreSQL included
- Global deployment
- Docker-based deployments

**Option 5: Heroku (Limited Free Tier)**
- Free tier available with credit card
- PostgreSQL add-on available
- Easy deployment via Git
- Note: Free tier has sleep mode after 30 min inactivity

### Database Hosting

**PostgreSQL:**
- **Neon.tech** - Free tier with 10 GB storage
- **ElephantSQL** - Free tier with 20 MB storage (good for testing)
- **Supabase** - Free tier with 500 MB storage + authentication
- **Render PostgreSQL** - Free for 90 days

**Redis:**
- **Upstash** - Free tier with 10,000 commands/day
- **Redis Cloud** - Free tier with 30 MB storage
- **Railway Redis** - Included in free credit

### File Storage

- **Cloudinary** - Free tier with 25 GB storage and 25 GB bandwidth
- **ImageKit** - Free tier with 20 GB storage and 20 GB bandwidth
- **Supabase Storage** - Free tier with 1 GB storage

### Mobile App Distribution

- **Expo Application Services (EAS)** - Free tier for builds
- **Google Play Console** - $25 one-time fee
- **Apple Developer Program** - $99/year

## Backend Deployment

### Step 1: Prepare Your Code

Ensure your backend code is in a Git repository (GitHub, GitLab, or Bitbucket).

```bash
cd backend
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Deploy to Render.com

**2.1. Create Account**
- Visit https://render.com
- Sign up with GitHub/GitLab account

**2.2. Create PostgreSQL Database**
- Click "New +" → "PostgreSQL"
- Name: `rwanda-real-estate-db`
- Region: Choose closest to Rwanda (Europe - Frankfurt recommended)
- PostgreSQL Version: 15
- Click "Create Database"
- Save the Internal Database URL and External Database URL

**2.3. Create Redis Instance (Optional)**
- Click "New +" → "Redis"
- Name: `rwanda-real-estate-redis`
- Region: Same as database
- Plan: Free
- Click "Create Redis"
- Save the Redis URL

**2.4. Create Web Service**
- Click "New +" → "Web Service"
- Connect your Git repository
- Configure:
  - Name: `rwanda-real-estate-api`
  - Region: Same as database
  - Branch: `main`
  - Root Directory: `backend`
  - Runtime: Node
  - Build Command: `npm install && npm run build`
  - Start Command: `npm start`
  - Plan: Free

**2.5. Configure Environment Variables**

Add the following environment variables in Render dashboard:

```
NODE_ENV=production
PORT=10000
API_URL=https://rwanda-real-estate-api.onrender.com

# Database (use Internal Database URL from Step 2.2)
DB_HOST=<from-render-postgres-url>
DB_PORT=5432
DB_NAME=<from-render-postgres-url>
DB_USER=<from-render-postgres-url>
DB_PASSWORD=<from-render-postgres-url>
DB_SSL=true

# Redis (use Redis URL from Step 2.3)
REDIS_HOST=<from-render-redis-url>
REDIS_PORT=<from-render-redis-url>
REDIS_PASSWORD=<from-render-redis-url>

# JWT Secrets (generate strong random strings)
JWT_SECRET=<generate-random-64-char-string>
JWT_REFRESH_SECRET=<generate-random-64-char-string>
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Cloudinary (sign up at cloudinary.com)
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>

# Email (SendGrid free tier - sign up at sendgrid.com)
SENDGRID_API_KEY=<your-sendgrid-api-key>
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Rwanda Real Estate

# SMS (Twilio free trial - sign up at twilio.com)
TWILIO_ACCOUNT_SID=<your-twilio-account-sid>
TWILIO_AUTH_TOKEN=<your-twilio-auth-token>
TWILIO_PHONE_NUMBER=<your-twilio-phone-number>

# Google Maps (get free API key from Google Cloud Console)
GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>

# CORS (your mobile app URL)
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
MAX_FILES_PER_PROPERTY=20
```

**2.6. Deploy**
- Click "Create Web Service"
- Render will automatically build and deploy your application
- Wait for deployment to complete (5-10 minutes)

### Step 3: Alternative - Deploy to Railway.app

**3.1. Create Account**
- Visit https://railway.app
- Sign up with GitHub account

**3.2. Create New Project**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository
- Select `backend` directory

**3.3. Add PostgreSQL**
- Click "New" → "Database" → "Add PostgreSQL"
- Railway automatically provides connection string

**3.4. Add Redis**
- Click "New" → "Database" → "Add Redis"
- Railway automatically provides connection string

**3.5. Configure Environment Variables**
- Click on your service → "Variables"
- Add all environment variables (same as Render.com list above)
- Railway auto-injects database URLs

**3.6. Deploy**
- Railway automatically deploys on every Git push
- Get your public URL from the service dashboard

## Mobile App Deployment

### Step 1: Configure Environment

Update `mobile/.env`:

```
API_URL=https://your-backend-url.onrender.com/api/v1
SOCKET_URL=https://your-backend-url.onrender.com
GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
APP_ENV=production
```

### Step 2: Update app.json

Update `mobile/app.json` with your actual values:

```json
{
  "expo": {
    "name": "Rwanda Real Estate",
    "slug": "rwanda-real-estate",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.rwandarealestate"
    },
    "android": {
      "package": "com.yourcompany.rwandarealestate"
    }
  }
}
```

### Step 3: Build with Expo EAS (Recommended)

**3.1. Install EAS CLI**
```bash
npm install -g eas-cli
```

**3.2. Login to Expo**
```bash
eas login
```

**3.3. Configure EAS**
```bash
cd mobile
eas build:configure
```

**3.4. Build for Android**
```bash
eas build --platform android --profile production
```

**3.5. Build for iOS (requires Apple Developer account)**
```bash
eas build --platform ios --profile production
```

**3.6. Download APK/IPA**
- Once build completes, download from Expo dashboard
- For Android: Install APK directly or upload to Google Play
- For iOS: Upload IPA to App Store Connect

### Step 4: Alternative - Classic Expo Build

**4.1. Build APK**
```bash
cd mobile
expo build:android -t apk
```

**4.2. Build for iOS**
```bash
expo build:ios
```

### Step 5: Publish to Stores

**Google Play Store:**
1. Create developer account ($25 one-time)
2. Create new app listing
3. Upload APK from EAS build
4. Complete store listing (screenshots, description)
5. Submit for review

**Apple App Store:**
1. Enroll in Apple Developer Program ($99/year)
2. Create app in App Store Connect
3. Upload IPA using Transporter app
4. Complete app information
5. Submit for review

## Database Setup

### Step 1: Run Migrations

After backend deployment, run database migrations:

**Option A: Using Render Shell**
```bash
# In Render dashboard, go to your web service
# Click "Shell" tab
npm run migrate
```

**Option B: Using Local Connection**
```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="<your-external-database-url>"
cd backend
npm run migrate
```

### Step 2: Seed Initial Data (Optional)

```bash
npm run seed
```

## Environment Configuration

### Generating Secure Keys

**JWT Secrets:**
```bash
# Generate random 64-character string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice to generate both `JWT_SECRET` and `JWT_REFRESH_SECRET`.

### Setting up Cloudinary

1. Sign up at https://cloudinary.com (free tier)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret
4. Add to environment variables

### Setting up SendGrid

1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Create API Key in Settings → API Keys
3. Verify sender email address
4. Add API key to environment variables

### Setting up Twilio

1. Sign up at https://twilio.com (free trial with $15 credit)
2. Get Account SID and Auth Token from Console
3. Get a phone number
4. Add credentials to environment variables

### Setting up Google Maps

1. Go to Google Cloud Console
2. Create new project
3. Enable Maps SDK for Android/iOS
4. Enable Places API and Geocoding API
5. Create API Key with restrictions
6. Add to environment variables

## Post-Deployment Checks

### Backend Health Check

**Step 1: Test API Endpoint**
```bash
curl https://your-backend-url.onrender.com/health
```

Expected response:
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Step 2: Test Database Connection**
```bash
curl https://your-backend-url.onrender.com/api/v1/properties
```

Should return empty array or properties list.

**Step 3: Test Authentication**
```bash
curl -X POST https://your-backend-url.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+250788123456",
    "password": "Test123456",
    "role": "seeker",
    "name": "Test User"
  }'
```

Should return user object with token.

### Mobile App Testing

**Step 1: Test on Expo Go**
```bash
cd mobile
expo start
```

Scan QR code with Expo Go app on your phone.

**Step 2: Test API Connection**
- Open app
- Try to register/login
- Check if properties load
- Test search functionality

### Database Verification

**Step 1: Connect to Database**

Using PostgreSQL client:
```bash
psql "<your-external-database-url>"
```

**Step 2: Verify Tables**
```sql
\dt
```

Should show all tables: users, profiles, properties, etc.

**Step 3: Check User Count**
```sql
SELECT COUNT(*) FROM users;
```

### Performance Monitoring

**Step 1: Check Response Times**
```bash
curl -w "@curl-format.txt" -o /dev/null -s https://your-backend-url.onrender.com/health
```

Create `curl-format.txt`:
```
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_total:  %{time_total}\n
```

**Step 2: Monitor Logs**

In Render dashboard:
- Go to your web service
- Click "Logs" tab
- Monitor for errors

### Security Checklist

- [ ] JWT secrets are strong random strings (64+ characters)
- [ ] Database password is strong
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled
- [ ] SSL/TLS is enabled (automatic on Render/Railway)
- [ ] Environment variables are not exposed in code
- [ ] API keys have appropriate restrictions
- [ ] Database has SSL enabled

### Cleanup Steps

**Remove Unnecessary Services:**

If you created test databases or services during setup:

1. **Render Dashboard:**
   - Go to unused services
   - Click "Settings" → "Delete Service"

2. **Railway Dashboard:**
   - Select unused service
   - Click "Settings" → "Delete Service"

3. **Database Cleanup:**
   ```sql
   -- Remove test data
   DELETE FROM users WHERE email LIKE '%test%';
   DELETE FROM properties WHERE title LIKE '%test%';
   ```

## Troubleshooting

### Backend Not Starting

**Issue:** Service fails to start

**Solutions:**
1. Check logs for error messages
2. Verify all environment variables are set
3. Ensure database connection string is correct
4. Check if database is accessible
5. Verify Node.js version compatibility

### Database Connection Errors

**Issue:** Cannot connect to database

**Solutions:**
1. Verify database URL format
2. Check if SSL is required (set `DB_SSL=true`)
3. Ensure database is running
4. Check firewall rules
5. Verify credentials

### Mobile App Cannot Connect to API

**Issue:** API requests fail

**Solutions:**
1. Verify API_URL in `.env` is correct
2. Check if backend is running
3. Test API endpoint in browser
4. Check CORS configuration
5. Verify network connectivity

### File Upload Failures

**Issue:** Images not uploading

**Solutions:**
1. Verify Cloudinary credentials
2. Check file size limits
3. Ensure correct file formats
4. Check upload middleware configuration
5. Verify storage quota

## Cost Optimization

### Free Tier Limits

**Render.com:**
- 750 hours/month (enough for 1 service running 24/7)
- Database sleeps after 90 days
- 100 GB bandwidth/month

**Railway.app:**
- $5 free credit/month
- Approximately 500 hours of runtime
- Unused credit rolls over

**Cloudinary:**
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

### Staying Within Free Limits

1. **Use a single backend instance** - Don't deploy multiple environments
2. **Optimize images** - Compress before upload
3. **Cache aggressively** - Use Redis for frequently accessed data
4. **Implement pagination** - Limit API response sizes
5. **Monitor usage** - Set up alerts in service dashboards

## Scaling Beyond Free Tier

When your app grows:

1. **Backend:** Upgrade to paid Render plan ($7/month) or Railway Pro ($20/month)
2. **Database:** Migrate to dedicated PostgreSQL (Render: $7/month, Railway: $5/month)
3. **CDN:** Use Cloudflare for static assets (free tier available)
4. **Monitoring:** Add Sentry for error tracking (free tier: 5k events/month)

## Support Resources

- **Render Documentation:** https://render.com/docs
- **Railway Documentation:** https://docs.railway.app
- **Expo Documentation:** https://docs.expo.dev
- **PostgreSQL Documentation:** https://www.postgresql.org/docs
- **React Native Documentation:** https://reactnative.dev/docs

---

**Last Updated:** January 2024
**Version:** 1.0.0
