# Murugo Homes – Mobile App Roadmap (APK-First)

This roadmap takes the mobile app from its current state to a **distributable Android APK** via direct download (website + QR code). **Apple App Store and Google Play Store are out of scope** for this phase; they can be planned later.

---

## Table of Contents

1. [Current Mobile App Status](#current-mobile-app-status)
2. [Target Outcome](#target-outcome)
3. [Phase Overview](#phase-overview)
4. [Phase 1: Setup & Backend Connection](#phase-1-setup--backend-connection)
5. [Phase 2: Authentication](#phase-2-authentication)
6. [Phase 3: Property Browsing](#phase-3-property-browsing)
7. [Phase 4: Property Creation (Listers)](#phase-4-property-creation-listers)
8. [Phase 5: Profile & Dashboard](#phase-5-profile--dashboard)
9. [Phase 6: Additional Features & Polish](#phase-6-additional-features--polish)
10. [Phase 7: Testing & Build APK](#phase-7-testing--build-apk)
11. [Phase 8: Distribution (APK Only)](#phase-8-distribution-apk-only)
12. [Key Commands](#key-commands)
13. [Cost (APK-Only Phase)](#cost-apk-only-phase)
14. [Later: Store Submission](#later-store-submission)

---

## Current Mobile App Status

### What Exists

| Area | Status |
|------|--------|
| **Project** | React Native (Expo) app in `mobile/` |
| **Navigation** | React Navigation (stack, bottom tabs, drawer); `AppNavigator`, `AuthNavigator`, `MainNavigator` |
| **Screens (shells)** | Login, Signup, Onboarding, Home, Search, Profile, Messages |
| **API client** | Axios client in `src/api/client.ts` with token interceptor and 401 handling |
| **Config** | `env.ts` (API_BASE_URL, SOCKET_URL, etc.), `theme.ts` |
| **State** | Zustand `authSlice`; React Query available |
| **Dependencies** | React Query, Zustand, react-hook-form, yup, expo-image-picker, expo-camera, maps, notifications, etc. |

### What’s Missing

| Area | Notes |
|------|--------|
| **Backend connection** | `API_BASE_URL` defaults to `http://localhost:5000/api/v1`; must point to `https://api.murugohomes.com` (or your API base path). |
| **Screen logic** | Auth, property list/detail, creation, profile are mostly shells; need real API calls and UI. |
| **API integration** | Auth, properties, favorites, user profile, upload endpoints not wired. |
| **State** | Auth store used; property/favorites stores and React Query usage to be implemented. |
| **Branding** | App icon and splash screen to be added for release. |

---

## Target Outcome

- **Android APK** that users can download from your website (e.g. `https://murugohomes.com/download/murugohomes.apk`) or via a QR code.
- **No store submission** in this phase: no Google Play, no Apple App Store, no TestFlight.
- **Features**: Login/register, browse/search/filter properties, property detail, favorites, (for listers) create listing with images, profile and settings, contact actions (call/WhatsApp).

---

## Phase Overview

| Phase | Focus | Duration (guide) |
|-------|--------|-------------------|
| 1 | Setup & backend connection | 1–2 days |
| 2 | Authentication (login, register, forgot password, token) | ~1 week |
| 3 | Property browsing (home, list, search/filter, detail, favorites) | ~1 week |
| 4 | Property creation for listers (multi-step form, images) | ~1 week |
| 5 | Profile & dashboard (view/edit profile, my properties, favorites, settings) | ~1 week |
| 6 | Extra features & UI polish | ~3–5 days |
| 7 | Testing & build APK | ~3–5 days |
| 8 | Host APK + website + QR code | 1–2 days |

Total: about **6–8 weeks** to a first distributable APK.

---

## Phase 1: Setup & Backend Connection

**Goal:** App talks to your real API; dev and release configs are clear.

### 1.1 Environment

- Confirm backend base URL (e.g. `https://api.murugohomes.com`). If the API is under a path (e.g. `/api`), use `https://api.murugohomes.com/api`.
- In `mobile/src/config/env.ts`, `API_BASE_URL` is read from `process.env.API_URL` (or Expo’s `extra` in `app.json`). Prefer **EAS / app config** so the same code can use different URLs per profile.
- **Development:** `.env` or `app.config.js` with `API_URL=https://api.murugohomes.com` (or your staging URL).
- **Production build:** Same base URL for the APK (or a dedicated production API URL if you have one).

### 1.2 API client

- In `mobile/src/api/client.ts`, baseURL already comes from config. Ensure it uses the env value (no hardcoded localhost in production).
- Align with web/backend: same auth header (`Bearer <token>`), same response shape. Backend uses `token` in login/register response; store that and send in `Authorization`.

### 1.3 Checklist

- [ ] Backend URL documented (e.g. in `mobile/README.md` or `docs`).
- [ ] Dev build hits `https://api.murugohomes.com` (or staging).
- [ ] Login/register request from the app reaches the backend (test with a real or test user).

---

## Phase 2: Authentication

**Goal:** Login, register, logout, and (optional) forgot password; token stored and used on every request.

### 2.1 Screens

- **Login** – Email + password; call `POST /auth/login`; store `token` (and optionally user); navigate to main app.
- **Register** – Email, phone, password, name, role (seeker/lister); call `POST /auth/register`; then login or auto-login.
- **Forgot password** – If backend supports it: email/phone → OTP → new password; otherwise hide or stub.

### 2.2 Flow

- **Auth state:** Use Zustand (e.g. `authSlice`) or context: `token` + `user` from AsyncStorage on app start; if token valid → main app, else → auth stack.
- **Logout:** Clear token and user; redirect to login.
- **401:** API client already clears token; add navigation to login (e.g. via a small auth listener or redirect in interceptor).

### 2.3 Backend alignment

- Endpoints: `POST /auth/login`, `POST /auth/register`, `GET /auth/me` (with Bearer).
- Response: e.g. `{ data: { user, token, refreshToken } }`. Store `token`; use refresh if you implement refresh flow later.

### 2.4 Checklist

- [ ] Login with real backend.
- [ ] Register new user (seeker/lister).
- [ ] Token sent on subsequent requests.
- [ ] Logout clears token and returns to login.
- [ ] 401 redirects to login.

---

## Phase 3: Property Browsing

**Goal:** Home with featured/list, full list with search and filters, property detail, and favorites.

### 3.1 Home

- Featured or latest properties: `GET /properties?limit=6&sortBy=...` (match backend query params).
- Optional: search bar that navigates to search/list with query.

### 3.2 Property list & search

- Screen (or tab) that lists properties: `GET /properties` with `page`, `limit`, `search`, `type`, `transactionType`, `minPrice`, `maxPrice`, etc.
- Search bar and filters (property type, transaction type, price range) that update query params and refetch.
- Pagination or “load more”.

### 3.3 Property detail

- `GET /properties/:id` (or your backend path). Show images, title, price, location, description, amenities, lister info.
- Contact: call, WhatsApp (use `property.lister.phone` / `whatsappNumber` if available). Only show when logged in if backend restricts.

### 3.4 Favorites

- `GET /favorites`, `POST /favorites/:propertyId`, `DELETE /favorites/:propertyId` (align with backend).
- Toggle favorite on list and detail; show “My Favorites” in profile/dashboard.

### 3.5 Checklist

- [ ] Home shows properties from API.
- [ ] List updates with search and filters.
- [ ] Detail loads one property; contact actions work.
- [ ] Favorites add/remove and persist for user.

---

## Phase 4: Property Creation (Listers)

**Goal:** Lister (and optionally admin) can create a listing with multi-step form and 3–20 images.

### 4.1 Access

- Only listers (and admin if desired) see “Add property” or “Create listing”; others don’t.

### 4.2 Form (4 steps – match web if possible)

1. **Basic** – Title, property type, transaction type, price, currency.
2. **Location** – District, sector, cell, address; optional lat/lng.
3. **Details** – Description, bedrooms, bathrooms, size, amenities, year built, etc.
4. **Images** – 3–20 images; upload via backend (e.g. `POST /properties/:id/media` or multipart create).

### 4.3 Validation

- Required fields per step; use react-hook-form + yup (or similar) for consistency with web.

### 4.4 Upload

- Backend often expects URLs (e.g. from Cloudinary). Flow: pick images → upload to your upload endpoint (or Cloudinary from app) → get URLs → send URLs in property create/update.
- If backend has `POST /upload` or `POST /properties/:id/media` with multipart, use that.

### 4.5 Checklist

- [ ] Only listers see create flow.
- [ ] All 4 steps submit; property created on backend.
- [ ] Images uploaded and linked to property (3–20).

---

## Phase 5: Profile & Dashboard

**Goal:** Profile view/edit, My Properties (listers), My Favorites, settings, logout.

### 5.1 Profile

- `GET /users/profile` (or `/auth/me`) to show name, email, phone, role, profile type, company, bio.
- Edit: `PUT /users/profile` with name, bio, company, etc.

### 5.2 My Properties (listers)

- `GET /properties/my/listings` (or your backend path). List with edit/delete; edit can open same multi-step form with prefill.

### 5.3 My Favorites

- List from `GET /favorites`; open property detail; remove favorite.

### 5.4 Settings

- Logout (clear token, go to login).
- Optional: notifications on/off, theme (if you add it later).

### 5.5 Checklist

- [ ] Profile loads and updates.
- [ ] Listers see My Properties and can edit/delete.
- [ ] Favorites list and deep link to detail.
- [ ] Logout works.

---

## Phase 6: Additional Features & Polish

**Goal:** Push notifications (optional), UI/UX polish, no critical bugs.

### 6.1 Push notifications (optional)

- If backend supports FCM: configure Firebase in app, send token to backend, show notifications when backend sends.
- Otherwise defer.

### 6.2 UI/UX

- Loading and error states on all main screens.
- Empty states (no properties, no favorites).
- Consistent styling (theme, Murugo brand color e.g. #949DDB where appropriate).

### 6.3 Checklist

- [ ] No crashes on main flows.
- [ ] Loading/error/empty states in place.
- [ ] Branding (colors, typography) consistent.

---

## Phase 7: Testing & Build APK

**Goal:** Manual test of main flows; then build a release APK.

### 7.1 Manual testing

- Auth: login, register, logout, 401.
- Browse: home, list, search, filters, detail, favorites.
- Lister: create property (all steps, images), my properties, edit.
- Profile: view, edit, favorites list, logout.
- Contact: call, WhatsApp from detail (with real or test number).

### 7.2 App icon & splash

- App icon: 1024×1024 PNG (Expo/EAS will generate sizes).
- Splash: e.g. centered logo on brand background; size per Expo docs.
- Set in `app.json` / `app.config.js` (Expo: `icon`, `splash`).

### 7.3 EAS Build (Android APK)

- Install EAS CLI: `npm install -g eas-cli`.
- Login: `eas login`.
- Configure project: `eas build:configure` (choose Android).
- In `eas.json`, define a profile that produces an **APK** (not AAB) for direct install:
  - `"android": { "buildType": "apk" }` in the profile you use for “preview” or “direct” distribution.
- Build:
  - **Preview / internal APK:**  
    `eas build --platform android --profile preview`  
    (or whatever profile has `buildType: "apk"`).
  - **Production APK:**  
    `eas build --platform android --profile production`  
    (again with `buildType: "apk"` for direct download).
- Download the APK from the EAS build page when the build finishes.

### 7.4 Checklist

- [ ] All critical flows tested on a real device.
- [ ] App icon and splash set.
- [ ] EAS build produces APK.
- [ ] APK installs and runs on at least one Android device.

---

## Phase 8: Distribution (APK Only)

**Goal:** Users can download and install the APK from your site; no stores.

### 8.1 Host the APK

- Upload the built APK to a stable URL, e.g.:
  - `https://murugohomes.com/download/murugohomes.apk`, or
  - `https://murugohomes.com/app/murugohomes.apk`
- Use your existing hosting (e.g. Vercel static, or same server as the web app). Ensure the URL is HTTPS and the file is served with a correct MIME type (e.g. `application/vnd.android.package-archive`).

### 8.2 Website section

- Add a “Download the app” or “Mobile app” section (e.g. on the landing page or a dedicated page).
- Include:
  - Short explanation: “Download the Android app and install manually.”
  - **Download button/link:** points to the APK URL.
  - **QR code:** encodes the same APK URL so users can scan on their phone and download.
- Optional: 2–4 step instructions: “Enable installs from unknown sources” (or “Allow from this browser”) → “Download” → “Open and install.”

### 8.3 QR code

- Generate a QR code that points to the APK URL (e.g. https://murugohomes.com/download/murugohomes.apk).
- Place it next to the download button so mobile users can scan and get the file.

### 8.4 Checklist

- [ ] APK URL is public and stable.
- [ ] Download page (or section) live with button + QR code.
- [ ] Instructions for enabling “unknown sources” (or equivalent) if needed.
- [ ] Test: scan QR on Android → download → install → open app.

---

## Key Commands

```bash
# Development
cd mobile
npm install
npm start                    # Expo dev server
npm run android              # Run on Android device/emulator

# Environment (example; use your actual API base URL)
# In .env or app.config.js: API_URL=https://api.murugohomes.com

# Build APK (EAS)
npm install -g eas-cli
eas login
eas build:configure          # First time
eas build --platform android --profile preview    # APK for testing
eas build --platform android --profile production # APK for distribution
# Download APK from EAS dashboard when build completes
```

**Note:** For direct APK install (no Play Store), use a profile with `"buildType": "apk"` in `eas.json`. AAB is for Play Store only.

---

## Cost (APK-Only Phase)

- **EAS Build:** Free tier (e.g. 30 builds/month) is enough for APK-only. Paid if you need more.
- **Backend:** Already on your VPS; no extra cost for the app.
- **Hosting APK + website:** Already covered by your current hosting.
- **No store fees** in this phase: no Google Play ($25) or Apple Developer ($99) until you decide to publish.

---

## Later: Store Submission

When you are ready to publish on stores (after APK distribution and feedback):

- **Google Play:** Developer account ($25 one-time), create app, upload AAB (build with `buildType: "aab"`), fill listing, submit. Then you can replace the “Download APK” button with a “Get it on Google Play” badge.
- **Apple App Store:** Developer account ($99/year), App Store Connect, upload IPA (EAS: `eas build --platform ios`), submit. Optionally use TestFlight for beta before public release.

This roadmap does not include store accounts, store listings, or TestFlight; add those in a separate “Store submission” plan when you’re ready.

---

## Summary

| Item | In scope (APK-first) | Out of scope (for later) |
|------|----------------------|---------------------------|
| Backend connection | Yes (api.murugohomes.com) | — |
| Auth, browse, create, profile, favorites | Yes | — |
| Build Android APK | Yes (EAS) | — |
| Host APK + website + QR code | Yes | — |
| Google Play Store | No | Yes (later) |
| Apple App Store | No | Yes (later) |
| TestFlight | No | Yes (later) |

The document at `docs/MOBILE_APP_ROADMAP.md` is the single place for this APK-first plan; update it as you complete phases or change scope.

**See also:** [Mobile App Enhancement Roadmap](./MOBILE_APP_ENHANCEMENT_ROADMAP.md) — guest view, property card styling, image gallery, lister and admin features, filters, and polish (for when the baseline app is working).
