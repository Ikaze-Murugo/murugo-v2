# Rwanda Real Estate Platform – Full Game Plan (Phases & Steps)

Use this document to choose what to work on next. Each phase lists concrete steps; many can be delegated to an AI assistant to implement.

---

## Phase 1 – Core flows (must work)

### 1.1 Create property (latitude/longitude + 400 errors)

**Goal:** Listers can create a property without errors; latitude/longitude are optional.

**What was done (you can verify after deploy):**

- **Backend**
  - `POST /properties` no longer uses `upload.array('images', 20)` so the JSON body is preserved and validation runs on the full object.
  - Validator: `latitude` / `longitude` are optional, allow `null`, and `.empty(null).empty('')` so empty strings from forms are accepted.
  - Controller: location is normalized (lat/long default to 0 when missing/invalid).
- **Frontend**
  - Create payload sends safe numbers for lat/long (0 when empty/NaN).
  - Create flow: upload images → create property → `addMedia(property.id, urls)`.

**Steps for you:**

1. Deploy backend (pull, rebuild, restart) and frontend (push to trigger Vercel).
2. Test: Add Property → fill steps 1–3, leave lat/long empty or fill them → Step 4 optional images → Create Property. Should succeed.
3. If it still fails: check browser Network tab for the failing request (status and response body) and backend logs (`sudo docker compose logs -f backend`).

**If you want to hand off:** Say “fix create property and latitude/longitude errors in production” and share the exact error message or response body.

---

### 1.2 Renters: logged-in state and logout

**Goal:** On the main site (home, properties), renters see that they’re logged in and can log out.

**Steps:**

1. Add a **global site header** (or reuse one) on public pages: home (`/`), `/properties`, `/properties/[id]`.
2. When **logged out:** show “Login” and “Register”.
3. When **logged in:** show “Logged in as [name/email]” and a “Log out” button that calls the same `logout()` as the dashboard and redirects to `/` or `/properties`.

**If you want to hand off:** Say “add global header with login state and logout for renters on the main site”.

---

### 1.3 Listing flow UX (optional for now)

**Goal:** Better UX when creating a listing (e.g. amenities, location).

**Steps (later):**

- Amenities: checkboxes or multi-select (e.g. WiFi, Parking, Security) instead of one comma-separated field.
- Location: optional map picker or “Use current location” for lat/long.
- Step labels and validation messages.
- Optional: “Save draft” and require at least one image.

**If you want to hand off:** Say “implement amenities checkboxes (and list) on add property page”.

---

## Phase 2 – Admin and stats

### 2.1 Admin stats (real data)

**Goal:** Admin dashboard shows real numbers instead of placeholders.

**Steps:**

1. **Backend:** Add endpoints (or reuse existing) for:
   - Total users (e.g. `GET /users/count` or include in a small admin stats API).
   - Total views / engagement (if you have analytics).
   - Pending approvals (if you add an approval workflow).
2. **Frontend:** Replace placeholder “—” and “0” with data from those APIs.

**If you want to hand off:** Say “add backend admin stats endpoint (user count, etc.) and wire it in the admin dashboard”.

---

## Phase 3 – Property images and media

### 3.1 Create property with images (already implemented)

**Goal:** Create property → upload images → attach URLs to the new listing.

**Status:** Implemented: upload via `POST /upload/multiple`, create property, then `POST /properties/:id/media` with `{ urls }`.

**Steps for you:**

1. Ensure backend has `/upload` routes and `POST /properties/:id/media` deployed.
2. Ensure Cloudinary env vars are set on the VPS (`CLOUDINARY_*`).
3. Test: Add Property with 1–2 images on Step 4 → Create → listing and detail show photos.

**If it fails:** Check Network tab (upload and add-media requests) and backend logs; share the error.

---

### 3.2 Edit property: add/remove images

**Goal:** On edit listing page, list current images, add new ones (upload then addMedia), remove some.

**Steps:**

1. **Backend:** Already have `POST /properties/:id/media` (add) and likely delete media by id; confirm route e.g. `DELETE /properties/:id/media/:mediaId`.
2. **Frontend (edit page):** Load property (with media), show thumbnails, “Add images” (upload + addMedia), “Remove” (call delete media).

**If you want to hand off:** Say “implement add/remove images on the edit property page”.

---

## Phase 4 – Polish and extra features

### 4.1 Loading and error states

**Goal:** No blank screens; clear feedback.

**Steps:**

- List/detail: loading skeletons or spinners.
- Errors: toasts or inline messages with retry where useful.
- Empty states: “No properties yet”, “No favorites”, “No reviews” with short copy and actions.

**If you want to hand off:** Say “add loading skeletons for property list and detail” or “add empty states for favorites and reviews”.

---

### 4.2 Messages, notifications, search (minimal UI)

**Goal:** Frontend pages that call existing (or stubbed) backend endpoints and show empty states until backend is ready.

**Steps:**

- **Messages:** Page that calls messages API and shows “No messages yet” or list.
- **Notifications:** Page or dropdown that calls notifications API and shows “No notifications” or list.
- **Search:** Search bar that calls search API and shows results or “No results”.

**If you want to hand off:** Say “add minimal Messages page calling existing API” (or Notifications / Search).

---

### 4.3 SEO and performance

**Goal:** Basic SEO and faster loads.

**Steps:**

- Meta tags per page (title, description) where missing.
- Sitemap and robots (you may already have these).
- Image optimization (e.g. Next.js Image, or CDN for Cloudinary URLs).

**If you want to hand off:** Say “add meta tags for property detail and listings pages” or “optimize images on property cards”.

---

## Phase 5 – Production and ops

### 5.1 Deploy latest changes

**Goal:** Get current code (including create-property and lat/long fixes) to production.

**Steps:**

1. **Commit and push**
   ```bash
   git add .
   git status
   git commit -m "Fix create property: no multer on create, lat/long optional and empty string allowed"
   git push origin main
   ```
2. **Vercel:** Auto-deploys from `main`. Check Deployments.
3. **VPS backend**
   ```bash
   ssh root@YOUR_VPS_IP
   cd /path/to/rwanda-real-estate-app
   git pull origin main
   sudo docker compose build backend --no-cache
   sudo docker compose up -d backend
   ```
4. **Verify:** Create a property (with and without lat/long, with and without images).

---

### 5.2 Monitoring and debugging

**Goal:** When something breaks, you can find the cause quickly.

**Steps:**

- Use [Monitoring Cheat Sheet](./MONITORING_CHEATSHEET.md) for logs, health, SSL.
- For create-property errors: check Network tab (request payload and response), and backend logs for validation or DB errors.

---

## Quick reference: “I want to work on…”

| You want to… | Phase / step | Hand-off phrase |
|--------------|--------------|------------------|
| Fix create property / lat-long errors | 1.1 | “Fix create property and latitude/longitude errors; here’s the error: …” |
| Let renters see they’re logged in and log out | 1.2 | “Add global header with login state and logout for renters” |
| Improve add-property form (amenities, etc.) | 1.3 | “Implement amenities checkboxes on add property page” |
| Real admin stats | 2.1 | “Add admin stats endpoint and wire it in the dashboard” |
| Add/remove images on edit listing | 3.2 | “Implement add/remove images on edit property page” |
| Loading and empty states | 4.1 | “Add loading skeletons for property list” / “Add empty states for favorites” |
| Messages / Notifications / Search UI | 4.2 | “Add minimal Messages page” (or Notifications / Search) |
| SEO or image optimization | 4.3 | “Add meta tags for property pages” / “Optimize images on property cards” |
| Deploy and verify | 5.1 | Follow steps in 5.1 (or “Walk me through deploying to production”) |

---

## Summary of fixes applied in this session (Phase 1.1)

1. **Backend `property.routes.ts`:** Removed `upload.array('images', 20)` from `POST /` (create). Create now accepts **JSON only**; images are uploaded via `POST /upload/multiple` and attached via `POST /properties/:id/media`.
2. **Backend `property.validator.ts`:** For create and update, `latitude` and `longitude` use `.empty(null).empty('')` so `null` and empty string from forms are treated as optional and don’t fail validation.
3. **Result:** Request body is no longer consumed by multer, and lat/long can be omitted or empty without causing 400 errors.

After deploying backend and frontend, test create property again. If errors persist, use Phase 1.1 “Steps for you” (point 3) and share the exact error so the next fix can be targeted.
