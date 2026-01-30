# VPS Backend Deployment – Issues & Fixes (Jan 2025)

**Context:** Deploying the Rwanda Real Estate / Murugo backend on a VPS with Docker Compose (Traefik, PostgreSQL, Redis). Domain: `api.murugohomes.com`.

**Outcome:** Backend builds, starts, and responds correctly; `curl https://api.murugohomes.com/health` returns JSON.

---

## 1. Backend container ran migration instead of server (restart loop)

### Symptoms

- `docker compose ps` showed backend as **Restarting (0)**.
- Logs showed only: `Migration complete`, `Tables created/updated successfully`, `Database connection established` in a loop.
- No "Server running on port 5000".
- `curl https://api.murugohomes.com/health` → **404 page not found**.

### Cause

The container was running the **migration script** (`node dist/database/migrations/run.js`) instead of the **API server** (`node dist/server.js`). The migration script exits with code 0 after running, so the container exited and Docker kept restarting it. Traefik had no healthy backend to route to.

### Fixes

- **docker-compose.yml:** Set an explicit `command: ["node", "dist/server.js"]` for the `backend` service so the default (or any override) cannot run the migration as the main process.
- **Backend Dockerfile:** Kept `CMD ["node", "dist/server.js"]` for consistency.
- **Operational:** Run migrations only when needed:  
  `sudo docker compose run --rm backend npm run migrate`

**Reference:** `docs/VPS_HANDOFF_ISSUE.md`, `docs/VPS_DEPLOYMENT.md` (troubleshooting: "Backend runs migration then restarts").

---

## 2. TypeScript build failures during Docker build

### 2a. Backup controllers and auth null assignment

**Symptoms:**  
`npm run build` in the Docker image failed with:

- `auth.controller.ts(288,5): error TS2322: Type 'null' is not assignable to type 'string'.` (and similar for `resetPasswordExpire`).
- Many errors in `src/controllers_backup/*` (e.g. property, review, upload, user controllers).

**Cause**

- **Auth:** After password reset, code set `user.resetPasswordToken = null` and `user.resetPasswordExpire = null`, but the `User` entity had those properties typed as `string` and `Date` (non-nullable).
- **Backup code:** A `controllers_backup` folder (or similar) was present on the VPS and was being compiled; it was out of sync with current models and caused type errors.

**Fixes**

- **User model (`backend/src/models/User.model.ts`):**
  - Typed nullable columns as `| null`: e.g. `verificationToken: string | null`, `resetPasswordToken: string | null`, `resetPasswordExpire: Date | null`, `whatsappNumber: string | null`, `lastLogin: Date | null`.
- **tsconfig.json:** Excluded backup/legacy code from compilation:
  - `**/*.backup`
  - `**/controllers_backup/**`
- **.dockerignore:** Added `**/*.backup` and `**/controllers_backup` so backup files are not sent to the Docker build context.

---

### 2b. Property routes – missing controller exports

**Symptoms:**  
Build failed with:

- `Property 'recordView' does not exist on type 'typeof import("...property.controller")'.`
- Same for `recordContact`, `recordShare`, `getMyListings`.

**Cause**

The repo deployed on the VPS (e.g. murugo-v2) had a different or older `property.controller` that did not export `recordView`, `recordContact`, `recordShare`, and `getMyListings`, while `property.routes.ts` was written to use those exports.

**Fix**

- **property.routes.ts:** Implemented the four handlers **inside the routes file** (using `AppDataSource`, `Property`, `PropertyView`, `successResponse`, `errorResponse`), and wired the routes to these local handlers instead of the controller. The routes file no longer depends on the controller exporting those four functions.
- **View count:** Used `property.viewsCount` (not `property.views`) when incrementing the view counter to match the `Property` model.

---

### 2c. PropertyStatus type in getMyListings

**Symptoms:**  
Build failed with:

- `Type '{ listerId: string; status?: string | undefined; }' is not assignable to type 'FindOptionsWhere<Property>'`  
- `Type '"string"' is not assignable to type 'PropertyStatus | FindOperator<PropertyStatus> | undefined'.`

**Cause**

The `where` object for `findAndCount` used `status` as a plain `string`. TypeORM’s `FindOptionsWhere<Property>` expects `status` to be the `PropertyStatus` enum.

**Fix**

- **property.routes.ts:** Imported `PropertyStatus` from the Property model.
- Typed the where clause as `{ listerId: string; status?: PropertyStatus }`.
- Only set `where.status` when the query param is a valid `PropertyStatus` value (e.g. `available`, `rented`, `sold`, `pending`), using `Object.values(PropertyStatus).includes(status as PropertyStatus)` and `status as PropertyStatus`.

---

## 3. TypeORM: "Data type Object is not supported by postgres" at runtime

### Symptoms

After the image built and the container ran `node dist/server.js`, the app crashed on startup with:

- `DataTypeNotSupportedError: Data type "Object" in "User.verificationToken" is not supported by "postgres" database.`

Same for other nullable fields on `User` that had been changed to `string | null` or `Date | null`.

### Cause

TypeORM infers the database column type from the TypeScript type. For union types like `string | null` and `Date | null`, at runtime (reflection/emit) it was inferring the type as **"Object"**, which PostgreSQL does not support for those columns.

### Fix

- **User model (`backend/src/models/User.model.ts`):** Set **explicit column types** for all nullable fields that use `| null`:
  - **Strings:** `verificationToken`, `resetPasswordToken`, `whatsappNumber` → `@Column({ type: 'varchar', nullable: true })`
  - **Dates:** `resetPasswordExpire`, `lastLogin` → `@Column({ type: 'timestamp', nullable: true })`

This forces TypeORM to use the correct PostgreSQL types instead of inferring "Object".

---

## Summary of files changed

| Area | File(s) | Change |
|------|--------|--------|
| Compose | `docker-compose.yml` | `command: ["node", "dist/server.js"]` for backend |
| Build | `backend/tsconfig.json` | Exclude `**/*.backup`, `**/controllers_backup/**` |
| Build | `backend/.dockerignore` | Exclude `**/*.backup`, `**/controllers_backup` |
| Model | `backend/src/models/User.model.ts` | Nullable types `\| null` + explicit `type: 'varchar'` / `type: 'timestamp'` |
| Routes | `backend/src/routes/property.routes.ts` | Inline handlers for recordView, recordContact, recordShare, getMyListings; PropertyStatus for getMyListings where clause |

---

## Verification commands (VPS)

```bash
# After deploy
sudo docker compose ps -a                    # backend should be Up (healthy)
sudo docker compose logs --tail 30 backend   # expect "Server running on port 5000"
curl -s https://api.murugohomes.com/health  # expect JSON with status/message
```

---

**Last updated:** January 2025
