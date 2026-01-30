# VPS Monitoring Cheat Sheet

Quick reference for monitoring and operating the backend stack (Docker Compose, Traefik, PostgreSQL, Redis) on the VPS.  
**Project path on server:** `~/murugo-v2` (or your repo directory).  
**Domain:** `api.murugohomes.com`

---

## Table of Contents

1. [Service Status](#service-status)
2. [Logs](#logs)
3. [Resource Usage](#resource-usage)
4. [SSL Certificate](#ssl-certificate)
5. [Database](#database)
6. [Restart Services](#restart-services)
7. [Update Application](#update-application)
8. [Health & API](#health--api)
9. [Troubleshooting One-Liners](#troubleshooting-one-liners)

---

## Service Status

```bash
sudo docker compose ps                    # All services (running/restarting/exit)
sudo docker compose ps -a                 # All containers including stopped
sudo systemctl status docker              # Docker daemon
sudo systemctl status docker.socket        # Docker socket (if needed)
```

---

## Logs

```bash
sudo docker compose logs -f backend       # Follow backend logs (live)
sudo docker compose logs -f traefik       # Follow Traefik (reverse proxy / SSL)
sudo docker compose logs -f db            # Follow PostgreSQL
sudo docker compose logs -f redis         # Follow Redis

sudo docker compose logs --tail 50 backend # Last 50 lines (backend)
sudo docker compose logs --tail 100 traefik
sudo docker compose logs backend          # All backend logs (no follow)
```

---

## Resource Usage

```bash
sudo docker stats                         # Real-time CPU/memory per container
sudo docker stats --no-stream             # One-shot snapshot

sudo df -h                                # Disk space (filesystems)
sudo du -sh ~/murugo-v2                   # Project directory size
sudo free -h                              # Memory (total/used/free)
sudo htop                                 # Interactive CPU/memory (install: apt install htop)
top                                       # Built-in process viewer
```

---

## SSL Certificate

```bash
# Inspect Let's Encrypt storage (Traefik)
sudo docker compose exec traefik ls -la /letsencrypt/acme.json

# Test TLS connection to API
openssl s_client -connect api.murugohomes.com:443 -servername api.murugohomes.com

# Check certificate expiry (from openssl output, look for "Verify return code" and dates)
echo | openssl s_client -connect api.murugohomes.com:443 -servername api.murugohomes.com 2>/dev/null | openssl x509 -noout -dates
```

---

## Database

```bash
# Connect to PostgreSQL (interactive psql)
sudo docker compose exec db psql -U rwanda_user -d rwanda_real_estate

# Create a backup (run from host)
sudo docker compose exec db pg_dump -U rwanda_user rwanda_real_estate > backup_$(date +%Y%m%d_%H%M).sql

# Quick DB check
sudo docker compose exec db pg_isready -U rwanda_user -d rwanda_real_estate

# List tables (inside psql)
\dt
```

---

## Restart Services

```bash
sudo docker compose restart backend       # Backend only
sudo docker compose restart traefik       # Traefik only
sudo docker compose restart db            # PostgreSQL only
sudo docker compose restart redis         # Redis only
sudo docker compose restart               # All services
```

---

## Update Application

```bash
cd ~/murugo-v2                            # Or your project path
git pull origin main

# Rebuild backend and recreate container
sudo docker compose build --no-cache backend
sudo docker compose up -d

# Or rebuild and restart all
sudo docker compose build --no-cache
sudo docker compose up -d
```

**Run migrations after code changes that touch the DB:**

```bash
sudo docker compose run --rm backend npm run migrate
```

---

## Health & API

```bash
# Health endpoint (via Traefik / public URL)
curl -s https://api.murugohomes.com/health

# From inside the server (direct to backend container)
sudo docker compose exec backend node -e "require('http').get('http://localhost:5000/health', (r) => { let d=''; r.on('data', c=>d+=c); r.on('end', ()=>console.log(d)) })"
```

---

## Troubleshooting One-Liners

```bash
# Backend keeps restarting?
sudo docker compose logs --tail 100 backend

# Out of disk?
sudo df -h && sudo docker system df

# Clean unused images/containers (careful: removes unused, not running)
sudo docker system prune -f

# Full compose state (resolved config)
sudo docker compose config

# Which image is the backend using?
sudo docker compose images
```

---

**See also:** [VPS Deployment Guide](./VPS_DEPLOYMENT.md) · [Quick Reference](./VPS_QUICK_REFERENCE.md) · [Resolved Issues Log](./issues/README.md)
