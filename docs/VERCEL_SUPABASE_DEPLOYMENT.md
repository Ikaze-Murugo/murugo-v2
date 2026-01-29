# Deploying with Vercel + Supabase

This guide covers running the Rwanda Real Estate backend on **Vercel** (serverless API) with **Supabase** (PostgreSQL). It is feasible with a few constraints and optional changes.

---

## Feasibility Summary

| Component | Vercel | Supabase | Notes |
|-----------|--------|----------|--------|
| **API (Express)** | Yes | — | Runs as a single serverless function; all routes rewritten to `/api`. |
| **PostgreSQL** | — | Yes | Use Supabase Postgres; connection pooler recommended for serverless. |
| **Redis** | No | — | Optional; leave `REDIS_HOST` unset on Vercel. Use Upstash Redis later if you need cache/sessions. |
| **Socket.io (real-time)** | No | Optional | Socket.io does not run on Vercel. Use **Supabase Realtime** or polling in the app. |
| **Migrations** | — | Yes | Run locally (or in CI) against Supabase DB; not from Vercel. |
| **File uploads** | Yes | — | Keep using Cloudinary (or Supabase Storage if you switch). |

---

## 1. Supabase Setup

### 1.1 Create project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. **New project** → choose org, name (e.g. `rwanda-real-estate`), DB password, region.
3. Wait for the project to be ready.

### 1.2 Get database connection (for serverless use pooler)

1. In the Supabase dashboard: **Project Settings** → **Database**.
2. Under **Connection string**, choose **URI** and copy the **Transaction** (pooler) connection string.  
   It looks like:  
   `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
3. For env vars, you can either:
   - Use the full **URI** as `DATABASE_URL`, or
   - Split into: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true`.

**Important for serverless:** Use the **pooler** (Transaction mode, port **6543**), not the direct connection (5432), to avoid exhausting connections.

| Env var | Example (from pooler URI) |
|---------|----------------------------|
| `DB_HOST` | `aws-0-us-east-1.pooler.supabase.com` |
| `DB_PORT` | `6543` |
| `DB_NAME` | `postgres` |
| `DB_USER` | `postgres.[project-ref]` |
| `DB_PASSWORD` | (your DB password) |
| `DB_SSL` | `true` |

### 1.3 Run migrations against Supabase

Migrations are **not** run on Vercel. Run them from your machine (or CI) using Supabase credentials:

```bash
cd backend
export DB_HOST=aws-0-xx-x.pooler.supabase.com
export DB_PORT=6543
export DB_NAME=postgres
export DB_USER=postgres.xxxxx
export DB_PASSWORD=your_password
export DB_SSL=true
npm run migrate
```

(Or set a `DATABASE_URL` and adapt your migration script to use it if you prefer.)

---

## 2. Vercel Setup

### 2.1 Deploy from GitHub

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. **Add New** → **Project** → import your `rwanda-real-estate-app` repo.
3. **Root Directory:** set to **`backend`** (important).
4. **Framework Preset:** Other (or leave default).
5. **Build & development:**
   - Build Command: `npm run build`
   - Output Directory: leave empty (we use serverless, not static export).
6. **Install Command:** `npm install`
7. Add **Environment Variables** (see below), then deploy.

### 2.2 Environment variables (Vercel)

In the Vercel project: **Settings** → **Environment Variables**. Add at least:

**Core**

- `NODE_ENV` = `production`
- `API_URL` = `https://your-project.vercel.app` (replace with your Vercel URL after first deploy)

**Database (Supabase pooler)**

- `DB_HOST` = (pooler host, e.g. `aws-0-us-east-1.pooler.supabase.com`)
- `DB_PORT` = `6543`
- `DB_NAME` = `postgres`
- `DB_USER` = `postgres.[project-ref]`
- `DB_PASSWORD` = (Supabase DB password)
- `DB_SSL` = `true`

**Redis (optional on Vercel)**  
Leave **unset** to skip Redis. Later you can add Upstash and set `REDIS_HOST`, etc.

**JWT**

- `JWT_SECRET` = (long random string)
- `JWT_REFRESH_SECRET` = (another long random string)
- `JWT_EXPIRE` = `7d`
- `JWT_REFRESH_EXPIRE` = `30d`

**Rest**  
Same as in your main deployment guide: Cloudinary, SendGrid, Twilio, Google Maps, CORS, rate limits, etc. Omit only Redis if you are not using it.

---

## 3. What the repo already has for Vercel

- **`backend/vercel.json`** – Rewrites all requests to `/api`, sets build command and function limits.
- **`backend/api/index.ts`** – Serverless entry: connects to DB once per instance, then forwards `(req, res)` to the Express app. Uses **`dist/app`** (so `npm run build` must run on deploy).
- **Redis** – Optional: if `REDIS_HOST` is not set, the app skips connecting to Redis (no Redis on Vercel by default).
- **Socket.io** – Not started on Vercel (no long-lived server). Real-time must be handled elsewhere (see below).

---

## 4. Important considerations

### 4.1 Real-time (messages / notifications)

- **Socket.io** does **not** run on Vercel (no persistent WebSockets in the serverless function).
- **Options:**
  1. **Supabase Realtime** – Subscribe to Postgres changes or a channel from the mobile app for new messages/notifications. Backend only writes to DB; clients listen via Supabase.
  2. **Polling** – Mobile app polls `/api/v1/messages` (or similar) on a timer.
  3. **Third-party** – e.g. Pusher, Ably (optional).

If you adopt Supabase Realtime, the backend stays as-is; you add Supabase client and subscriptions in the app and optionally use Supabase’s `realtime` schema/channels.

### 4.2 Cold starts and timeouts

- First request after idle can be slower (cold start).
- Vercel function **max duration** is set in `vercel.json` (e.g. 30s). Long-running work (big uploads, heavy processing) may need to be offloaded (queue, background job, or different host).

### 4.3 Migrations and schema

- **Never** rely on `synchronize: true` in production (your app already uses it only in development).
- Run migrations **locally** (or in CI) against the Supabase connection string before or after each deploy.

### 4.4 Mobile app configuration

- Set **`API_URL`** (and any base URL for the API client) to your Vercel URL, e.g. `https://your-project.vercel.app`.
- **`SOCKET_URL`** – If you remove Socket.io and use Supabase Realtime or polling, you can leave it unset or point it to a placeholder; the app should handle “no socket” gracefully (e.g. only use HTTP + Realtime/polling).

### 4.5 File uploads

- Keep using **Cloudinary** (or another provider) as in your current setup. Vercel serverless can proxy uploads or the app can upload directly from the client to Cloudinary; both are feasible.

---

## 5. Quick checklist

- [ ] Supabase project created; DB password saved.
- [ ] Connection details use **pooler** (port 6543), not direct (5432).
- [ ] Migrations run once against Supabase (locally or CI).
- [ ] Vercel project created with **Root Directory** = `backend`.
- [ ] All required env vars set on Vercel (DB, JWT, Cloudinary, etc.); Redis omitted if not used.
- [ ] First deploy succeeds; `API_URL` set to the Vercel deployment URL.
- [ ] Health check: `curl https://your-project.vercel.app/health`.
- [ ] Mobile app `API_URL` (and optional `SOCKET_URL`) updated; real-time handled via Supabase Realtime or polling.

---

## 6. Optional: Supabase Storage and Auth

- **Storage:** You can later move image uploads to Supabase Storage and update the backend to use Supabase client instead of (or in addition to) Cloudinary.
- **Auth:** The app currently uses its own JWT auth. You can keep it and only use Supabase for DB (and Realtime). Migrating to Supabase Auth is a larger change and not required for this deployment.

Using **Vercel + Supabase** for this app is feasible: API on Vercel, database on Supabase, Redis optional, real-time via Supabase Realtime or polling.
