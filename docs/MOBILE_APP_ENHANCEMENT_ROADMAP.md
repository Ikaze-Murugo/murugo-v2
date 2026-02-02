# Rwanda Real Estate – Mobile App Enhancement Roadmap

This roadmap builds on the **working baseline** (login, property list/detail, navigation) and adds guest experience, UI polish, role-based features (admin, lister), and other enhancements. Use it as a phased checklist.

---

## Table of Contents

1. [Overview](#overview)
2. [Phase A: Guest View & First-Launch Experience](#phase-a-guest-view--first-launch-experience)
3. [Phase B: Property Cards & Listings UI](#phase-b-property-cards--listings-ui)
4. [Phase C: Property Detail – Full Image Gallery](#phase-c-property-detail--full-image-gallery)
5. [Phase D: Lister Features](#phase-d-lister-features)
6. [Phase E: Admin Features](#phase-e-admin-features)
7. [Phase F: Cross-Cutting & Polish](#phase-f-cross-cutting--polish)
8. [Phase G: Optional / Later](#phase-g-optional--later)
9. [Implementation Notes](#implementation-notes)

---

## Overview

| Phase | Focus | Priority |
|-------|--------|----------|
| A | Guest view, onboarding, browse without login | High |
| B | Property card styling, lister on card | High |
| C | Property detail – all images, gallery | High |
| D | Lister: my listings, create/edit, analytics | High |
| E | Admin: stats, users, moderation | High |
| F | Filters, contact actions, accessibility, performance | Medium |
| G | Map view, push notifications, deep links | Later |

**Backend alignment:** The API already supports guest (optional auth), listers (`/properties/my/listings`, create, update, analytics), and admin (`/admin/stats`, `/admin/users`). Ensure property list/detail responses include `lister` (with profile) and `media` for full gallery.

---

## Phase A: Guest View & First-Launch Experience

**Goal:** Users can open the app and browse properties without logging in. First-time users get a clear path to sign up or continue as guest.

### A.1 Navigation for guest vs authenticated

- [ ] **Guest flow:** If no token, show **Main** app (tabs: Home, Search, Profile) instead of forcing Auth.
- [ ] **Auth stack** only for: Login, Signup, Onboarding (first launch).
- [ ] **Profile tab (guest):** Show “Sign in” / “Create account” and limited actions (e.g. “Save favorites after sign in”). Do not show “My listings” or “Log out”.
- [ ] **Profile tab (logged in):** Show user info, My listings (if lister), Favorites, Settings, Log out.
- [ ] **Optional:** “Continue as guest” on Onboarding; store a flag so next launch goes straight to Main (guest).

### A.2 Onboarding

- [ ] Show onboarding only on **first launch** (e.g. `AsyncStorage`: `hasSeenOnboarding`).
- [ ] Slides: value proposition, browse properties, sign up to save favorites / list properties.
- [ ] CTA: “Get started” → Main (guest), “Sign in” → Login, “Create account” → Signup.
- [ ] Skip option that goes to Main (guest).

### A.3 Guest limitations (clear in UI)

- [ ] Favorites: show empty state “Sign in to save favorites” with Sign in button.
- [ ] Contact (call/WhatsApp): show “Sign in to contact lister” or allow call without login (business decision).
- [ ] Listing creation: only available when logged in as lister; show “Sign in as lister” in Profile.

### A.4 Checklist

- [ ] App opens to guest Main (or Onboarding if first time).
- [ ] Guest can browse Home and Search; Profile shows sign-in prompts.
- [ ] After login, full features (favorites, contact, my listings for listers) appear.

---

## Phase B: Property Cards & Listings UI

**Goal:** Property cards look consistent and professional; show lister info for logged-in users.

### B.1 Property card styling

- [ ] **Layout:** Consistent image aspect ratio (e.g. 16:10 or 4:3), rounded corners, subtle shadow.
- [ ] **Image:** Primary image from `property.media[0]`; fallback placeholder (icon + “No image”).
- [ ] **Typography:** Title (1 line ellipsis), price prominent, transaction type (rent/sale), location (1 line).
- [ ] **Meta row:** Beds, baths, size (e.g. “3 bed · 2 bath · 120 m²”) when available.
- [ ] **Favorite:** Heart icon; only show when user is logged in; call favorites API on tap.
- [ ] **Featured badge:** Keep “Featured” pill on image when `property.isFeatured`.
- [ ] **Status (for listers):** Optional small chip (Available / Pending / Rented / Sold) on card when viewing “My listings”.

### B.2 Lister on property card (logged-in users)

- [ ] **Backend:** Ensure `GET /properties` and `GET /properties/:id` return `lister` with at least `id`, `profile.name`, `profile.avatarUrl`, `profile.companyName` (optional).
- [ ] **Card:** When `property.lister` exists and user is logged in, show below meta row:
  - Lister avatar (small circle) or initials.
  - Lister name or company name (e.g. “John D.” or “ABC Realty”).
  - Optional: tap to go to lister public profile (e.g. `/listers/:id` screen if you add it).
- [ ] **Guest:** Can hide lister block on card to reduce clutter, or show “Sign in to see lister” (optional).

### B.3 List performance & empty states

- [ ] **FlatList** for property list: `keyExtractor`, `getItemLayout` if fixed height for faster scroll.
- [ ] **Empty state:** “No properties found” with illustration or icon; adjust filters or try again.
- [ ] **Loading:** Skeleton cards or spinner while fetching.

### B.4 Checklist

- [ ] Cards have consistent styling and show price, location, beds/baths/size.
- [ ] Logged-in users see lister (avatar + name) on each card.
- [ ] Favorites toggle works on card when logged in.

---

## Phase C: Property Detail – Full Image Gallery

**Goal:** Property detail screen shows all related images in a gallery (swipe/carousel or grid).

### C.1 Image gallery

- [ ] **Data:** Property detail API returns `media[]` with `url`, `type`, `order`. Use all `type === 'image'` ordered by `order`.
- [ ] **Primary block:** Horizontal scroll (flat list or carousel) of all images; dots or “1/5” indicator.
- [ ] **Tap image:** Full-screen image viewer (optional: pinch zoom, swipe to next/prev).
- [ ] **Fallback:** If no images, show placeholder (icon + “No images”) and rest of detail.

### C.2 Detail layout

- [ ] **Sections:** Title, price + transaction type, location (with map link if coords exist), description, amenities, specs (beds, baths, size, etc.), lister card (avatar, name, contact).
- [ ] **Lister card:** Name, company (if any), “Call” / “WhatsApp” (use `lister.profile` / `lister.whatsappNumber` or phone from API).
- [ ] **Actions:** Favorite (if logged in), Share (native share with property link/title).

### C.3 Checklist

- [ ] All property images display in a swipeable gallery.
- [ ] Lister contact (call/WhatsApp) works from detail screen.
- [ ] Share and favorite work when logged in.

---

## Phase D: Lister Features

**Goal:** Listers can manage their listings, create new ones with images, and see simple analytics.

### D.1 My Listings screen

- [ ] **Entry:** Profile tab → “My listings” (only visible when `user.role === 'lister'` or admin).
- [ ] **API:** `GET /properties/my/listings` with optional `?status=pending`.
- [ ] **UI:** List of property cards (same component as Home/Search) with status chip; pull-to-refresh.
- [ ] **Actions per card:** Tap → detail; long-press or “…” menu → Edit, Mark sold/rented, Delete (with confirm).
- [ ] **Empty state:** “You have no listings yet” + “Add property” button → Create flow.

### D.2 Create / Edit property

- [ ] **Create:** Multi-step or single long form: title, description, type, transaction, price, location (district, sector, address), beds, baths, size, amenities, etc.
- [ ] **Images:** Upload multiple (camera/gallery); send via `POST /upload/multiple` or existing upload API, then attach to property via `POST /properties/:id/media` or include in create payload if backend supports.
- [ ] **Edit:** Pre-fill form from `GET /properties/:id`; `PUT /properties/:id` with updated fields and image handling.
- [ ] **Validation:** Required fields and formats aligned with backend (e.g. price > 0, valid district).

### D.3 Lister analytics (per property)

- [ ] **API:** `GET /properties/:id/analytics` (views, etc.).
- [ ] **UI:** On property detail (when current user is lister/owner) or in “My listings” detail: show “Views: 42”, “Contacts: 5” (if backend provides).

### D.4 Checklist

- [ ] Lister sees “My listings” and list of their properties with status.
- [ ] Create property with images works; Edit works.
- [ ] Basic analytics (views) visible for own listings.

---

## Phase E: Admin Features

**Goal:** Admin users get a dedicated area for platform stats, user management, and property moderation.

### E.1 Admin entry & role check

- [ ] **Role:** Backend returns `user.role === 'admin'`. Only then show “Admin” in drawer/tabs or Profile.
- [ ] **Route:** e.g. “Admin” tab or “Admin” item in Profile → Admin stack (Stats, Users, Moderation).

### E.2 Dashboard / Stats

- [ ] **API:** `GET /admin/stats` (total users, total properties, available, pending, etc.).
- [ ] **UI:** Cards or list: Total users, Total properties, Available, Pending approval, etc.
- [ ] **Refresh:** Pull-to-refresh or manual refresh.

### E.3 User management

- [ ] **API:** `GET /admin/users` with pagination/search if backend supports.
- [ ] **UI:** List of users (email, name, role, status); tap for user detail.
- [ ] **Actions (if backend supports):** Deactivate user, change role; otherwise read-only for now.

### E.4 Property moderation

- [ ] **API:** List properties with `status=pending` (e.g. `GET /properties?status=pending` with admin auth) or dedicated `GET /admin/properties/pending` if available.
- [ ] **UI:** List of pending properties; tap to open detail.
- [ ] **Actions:** Approve (set status to available), Reject (set status to rejected). Backend: `PATCH /properties/:id/status` with body `{ status: 'available' | 'rejected' }`.

### E.5 Checklist

- [ ] Admin sees Stats and User list.
- [ ] Admin can approve/reject pending properties (if backend supports status workflow).

---

## Phase F: Cross-Cutting & Polish

**Goal:** Filters, contact actions, accessibility, and performance so the app feels complete.

### F.1 Search & filters

- [ ] **Search screen:** Search by text (title/location); filters: property type, transaction type, min/max price, beds, baths.
- [ ] **API:** Align with `GET /properties?search=...&propertyType=...&minPrice=...` etc.
- [ ] **UI:** Filter chips or bottom sheet; “Apply” updates list; show active filter count.
- [ ] **Sort:** Price (low/high), newest, relevance (if backend supports).

### F.2 Contact actions

- [ ] **Call:** `Linking.openURL('tel:' + listerPhone)`.
- [ ] **WhatsApp:** `Linking.openURL('https://wa.me/' + normalizedNumber)` (use `lister.profile.whatsappNumber` or phone).
- [ ] **Optional:** `POST /properties/:id/contact` when user taps “Contact” (for analytics).

### F.3 Favorites

- [ ] **List:** `GET /favorites` with property details; remove with `DELETE /favorites/:propertyId`.
- [ ] **Sync:** Favorite state on cards and detail screen matches server after add/remove.

### F.4 Accessibility & UX

- [ ] **Labels:** Important images and buttons have `accessibilityLabel`.
- [ ] **Contrast:** Text and buttons meet minimum contrast.
- [ ] **Loading states:** No blank screens; spinners or skeletons where needed.
- [ ] **Error states:** “Something went wrong” + Retry; network errors handled.

### F.5 Performance

- [ ] **Images:** Lazy load in lists; consider smaller thumbnails for list view.
- [ ] **Lists:** `FlatList` with `windowSize` / `maxToRenderPerBatch` if long lists.
- [ ] **Avoid unnecessary re-renders:** Memoize list items and callbacks where it helps.

### F.6 Checklist

- [ ] Filters and sort work on Search.
- [ ] Call and WhatsApp open correctly from property/lister.
- [ ] Favorites list and toggle are consistent.
- [ ] Basic a11y and error handling in place.

---

## Phase G: Optional / Later

- **Map view:** Map of properties (e.g. Map tab with pins); backend may need endpoint for “properties in bounds”.
- **Push notifications:** New message, listing approved, new favorite; requires FCM/APNs and backend integration.
- **Deep links:** Open property or lister profile from link (e.g. `murugohomes://property/123`).
- **Offline:** Cache recent list/detail for offline viewing (e.g. React Query persistence).
- **Localization:** Kinyarwanda / English if needed.
- **Dark mode:** Use theme from React Native Paper (MD3 light/dark).
- **In-app messaging:** If backend has messaging API, add Messages screen with thread list and chat.
- **Reviews & ratings:** If backend supports reviews, show on lister profile and property.

---

## Implementation Notes

### Backend alignment

- **Guest:** Use `optionalAuth` on `GET /properties` and `GET /properties/:id` so responses are the same with or without token; include `lister` and `media` in payload.
- **Lister:** `GET /properties/my/listings`, `POST /properties`, `PUT /properties/:id`, `GET /properties/:id/analytics`, `PATCH /properties/:id/status` (for listers on own property, admin on any).
- **Admin:** `GET /admin/stats`, `GET /admin/users`; property status update via `PATCH /properties/:id/status`.
- **Listers public profile:** `GET /listers/:id` returns lister + their properties; use for “View lister” from card or detail.

### Suggested order

1. **Phase A** (guest + onboarding) so everyone can use the app without login.
2. **Phase B** (cards + lister on card) for better first impression.
3. **Phase C** (gallery on detail) for complete property view.
4. **Phase D** (lister flows) then **Phase E** (admin).
5. **Phase F** (filters, contact, a11y) in parallel or after.

### Files to touch (mobile)

- **Navigation:** `AppNavigator.tsx` (guest vs auth), `MainStackNavigator.tsx`, `MainNavigator.tsx` (tabs/drawer; show Admin/My listings by role).
- **Screens:** Onboarding (first-launch), Home, Search, PropertyDetail (gallery, lister card, contact), Profile (guest vs logged-in, My listings, Admin entry), new: MyListingsScreen, CreateEditPropertyScreen, AdminStatsScreen, AdminUsersScreen, AdminModerationScreen (or combined Admin screen).
- **Components:** `PropertyCard.tsx` (styling, lister row, favorite).
- **API:** Ensure `propertyApi`, `favoriteApi`, `authApi`; add `adminApi` (stats, users), and use existing property create/update/analytics/status endpoints.
- **State:** Keep auth in Zustand; React Query for properties, favorites, admin stats/users.

---

You can track progress by checking off items in each phase. If you want, we can break down a single phase into step-by-step code changes (e.g. “Guest view in AppNavigator” or “Property card lister row”) next.
