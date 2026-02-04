# Rwanda Real Estate Platform – Proposed Next Steps

This document outlines suggested next steps for the **web app**, **mobile app**, and **backend** now that Expo Go works and the main enhancement phases (A–E) are in place on mobile.

---

## 1. Current state (summary)

| Area | Done |
|------|------|
| **Backend** | Auth, properties (CRUD, list, filters, my-listings, analytics), favorites, listers public profile, admin (stats, users), uploads (Cloudinary), optional auth for guest browsing. |
| **Web** | Landing, auth, property list/detail, filters, search, lister profile, dashboard (role-based), admin stats/users, property upload (multi-step), favorites. |
| **Mobile** | Guest onboarding, browse without login, property cards + lister on card, full image gallery on detail, favorites, My Listings, Create property, Admin dashboard + users, lister stats on own listing. |

---

## 2. Web application – proposed next steps

### High priority
- **About / Contact** – Replace placeholders with real content (company info, contact form or email/phone).
- **Property moderation (admin)** – Admin flow to list **pending** properties and **approve/reject** (backend has `PATCH /properties/:id/status`; web dashboard can add a “Pending” section and actions).
- **Edit profile** – If not fully wired: ensure dashboard profile page updates name, phone, avatar (and backend profile/upload endpoints).

### Medium priority
- **Lister public profile** – Ensure listers can share their profile URL (`/listers/[id]`) and that it’s linked from property cards and detail.
- **SEO & meta** – Per-page titles/descriptions (and OG tags for property/lister pages) for sharing and search.
- **Error and empty states** – Consistent “Something went wrong” + Retry and empty-state copy on list/dashboard pages.

### Later
- **Messaging** – If backend messaging is ready, add inbox/thread UI on web.
- **Reviews** – If backend supports reviews, show and submit on property/lister pages.
- **Analytics** – Simple dashboard for listers (views/contacts per listing) if not already present.

---

## 3. Mobile application – proposed next steps

### Phase F – Cross-cutting and polish (recommended next)
- **Search filters** – Min/max price, beds, baths on Search screen; align with `GET /properties` query params.
- **Sort** – Price (low/high), newest on Search (and optionally Home).
- **Contact actions** – Call and WhatsApp are already on detail; ensure they work from lister card if you add “Contact” there.
- **Favorites sync** – Already in place; optionally add pull-to-refresh on Favorites screen.
- **Accessibility** – Add `accessibilityLabel` to main buttons and images.
- **Error handling** – Retry on failed loads; “Sign in to contact” for guests on detail if you restrict contact.

### Phase G – Optional / later
- **Map view** – Tab or screen with map and property pins (backend may need “properties in bounds” or use current list with lat/lon).
- **Push notifications** – FCM/APNs + backend for new message, listing approved, etc.
- **Deep links** – e.g. `murugohomes://property/123` to open property in app.
- **In-app messaging** – Messages screen with thread list and chat if backend is ready.
- **Dark mode** – React Native Paper MD3 dark theme.
- **Localization** – Kinyarwanda / English if required.

### Build and distribution (when ready)
- **EAS Build** – Build Android APK (and optionally iOS) with `eas build --platform android` (see [MOBILE_APP_ROADMAP.md](./MOBILE_APP_ROADMAP.md)).
- **APK distribution** – Host APK on your site (e.g. murugohomes.com/download) and link from landing; optional QR for download.
- **Store submission** – Google Play / App Store when you’re ready (out of scope for current “APK-first” plan).

---

## 4. Backend – proposed next steps

### Fixes and alignment
- **Property status (PATCH)** – Backend `updatePropertyStatus` currently allows `'active'|'inactive'|'sold'|'rented'`; align with `PropertyStatus` enum (`available`, `pending`, `rented`, `sold`) so mobile and web can update status consistently.
- **My Listings response** – Ensure `GET /properties/my/listings` returns `lister` (or at least listerId) if the web dashboard needs it; mobile uses `showLister={false}` there.

### Optional enhancements
- **Admin: pending properties** – Dedicated `GET /admin/properties/pending` (or re-use `GET /properties?status=pending` with admin auth) for moderation UI.
- **Soft delete** – If “delete” is currently soft (e.g. set status to pending), document it; optionally add an explicit “archived” or “deleted” state and filter it out of public and my-listings.
- **Rate limiting and security** – Rate limit auth and upload endpoints; ensure CORS and env vars are production-ready (see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)).

---

## 5. Cross-cutting – deployment, quality, docs

### Deployment and env
- **Backend** – Deploy to Render/Railway/VPS (see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) and [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md)); set production env (DB, Redis, Cloudinary, JWT secret).
- **Web** – Deploy to Vercel (or similar); set `NEXT_PUBLIC_API_URL` (and any other public env) for production.
- **Mobile** – Set `EXPO_PUBLIC_API_URL` (and optional SOCKET/keys) for production builds; use same API base URL as web in production.

### Quality and maintenance
- **Testing** – Add a few critical path tests: e.g. auth flow, property list, and (if time) one key API route.
- **Monitoring** – Health check endpoint and simple uptime/monitoring (e.g. UptimeRobot) for API and web.
- **Docs** – Keep [MOBILE_APP_ENHANCEMENT_ROADMAP.md](./MOBILE_APP_ENHANCEMENT_ROADMAP.md) and [MOBILE_APP_ROADMAP.md](./MOBILE_APP_ROADMAP.md) updated as you complete phases; add a short “Release checklist” (env, build command, APK upload) when you ship the first APK.

---

## 6. Suggested order of work

1. **Backend** – Fix property status enum for `PATCH /properties/:id/status` so web and mobile can approve/reject or set status consistently.
2. **Web** – Admin property moderation (list pending, approve/reject); finish About/Contact content.
3. **Mobile** – Phase F (filters, sort, a11y, error handling).
4. **Deployment** – Ensure API and web are live and stable; then build mobile APK and add download link + QR from the website.

You can tackle these in parallel (e.g. backend fix + web moderation + mobile Phase F) and then focus on build and distribution.
