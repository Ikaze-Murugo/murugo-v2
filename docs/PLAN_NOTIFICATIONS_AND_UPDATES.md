# Plan: Notifications & App Updates (Direct APK)

This document proposes **recommended methods** for managing **push notifications** and **app updates** when the Android app is distributed as a direct APK (no Play Store). Review and approve before any code changes.

---

## Scope

| Area | Goal |
|------|------|
| **Notifications** | Send push notifications to users (e.g. listing approved, new message) when they have the APK installed. |
| **Updates** | Let users know when a new APK is available and where to download it; optionally push small fixes without a new APK. |

---

## Part 1: Push Notifications

### Recommended method: **FCM + your backend**

- **FCM (Firebase Cloud Messaging)** is the standard for Android push. It works the same for direct APK and for Play Store apps.
- Your backend stores each device’s FCM token and sends notifications when your app logic triggers them (e.g. listing approved, new message).

**Flow:**

1. User installs the APK and logs in (or grants notification permission).
2. App requests notification permission, gets an **FCM device token** (via `expo-notifications`), and sends it to your backend (e.g. `POST /users/fcm-token` or on login).
3. Backend saves the token (e.g. in a `user_devices` or `fcm_tokens` table) linked to the user.
4. When an event happens (e.g. admin approves a listing), backend calls **FCM HTTP v1 API** (or Firebase Admin SDK) to send a notification to the lister’s token(s).
5. User’s device receives the notification; tapping it can open the app (and optionally a specific screen).

**Why this:**

- Full control: you decide when to send (listing approved, new message, etc.).
- No dependency on Play Store.
- You already have `expo-notifications` in the app and Firebase-related env placeholders in backend and mobile; this builds on that.

**Alternatives (not recommended for first version):**

- **Firebase Console only:** Manual “Send message” in Firebase; no automation from your app logic.
- **Third-party (OneSignal, etc.):** Adds a service and UI; FCM + backend is enough for event-driven notifications.

### What would be implemented (after approval)

| Layer | Work |
|-------|------|
| **Firebase** | Create/use a Firebase project, add Android app (package `com.rwanda.realestate`), enable Cloud Messaging, obtain server credentials (for backend). |
| **Mobile** | Request permission, get FCM token via `expo-notifications`, send token to backend on login (and when it changes). Handle notification tap (e.g. open app / deep link). |
| **Backend** | New endpoint(s): e.g. `POST /users/fcm-token` (save/update token per user/device). Use Firebase Admin SDK or FCM HTTP v1 to send when e.g. listing status changes to “approved” (and later: new message). |
| **Env** | Backend: Firebase project ID, private key, client email (service account). Mobile: already has Firebase placeholders; add `google-services.json` or Expo config for FCM. |

**Out of scope for this plan:** Building a full “notification center” in the app; that can be a later phase. This plan is “send push when events happen.”

---

## Part 2: App Updates

You have two kinds of “updates”:

- **Full app update** = new APK (new version, possibly native changes). User must download and install the new APK.
- **Over-the-air (OTA) update** = new JavaScript bundle only. User gets it on next app launch without reinstalling.

### Recommended method A: **In-app “new version available” check (full APK)**

- Backend exposes a small endpoint that returns the **current public app version** and **download URL** for the latest APK.
- App calls this on launch (or from a “Check for updates” in Settings). If the server version is greater than the app’s version, show a dialog: “A new version is available. Download?” with a button that opens the download URL in the browser.
- User downloads and installs the new APK manually (normal for direct APK distribution).

**Flow:**

1. You release a new APK: bump `version` in `app.json` (e.g. `1.0.1`), run `eas build`, host the new APK at a stable URL (e.g. `https://murugohomes.com/download/murugohomes.apk`).
2. Backend (or a simple JSON file you host) returns e.g. `{ "android": { "version": "1.0.1", "downloadUrl": "https://murugohomes.com/download/murugohomes.apk", "minVersion": "1.0.0" } }`. Optional: `minVersion` to force upgrade if security fix.
3. App reads its own version from `expo-constants` (or `Application.nativeApplicationVersion`), compares to `version`. If server is newer → show dialog and open `downloadUrl`.

**Why this:**

- Simple, no extra services.
- Works with any hosting (your site, Vercel, etc.).
- You “manage” updates by building a new APK, uploading it, and updating the version + URL in the backend (or config).

### Recommended method B (optional): **EAS Update for JS-only fixes (OTA)**

- For **JavaScript/asset-only changes** (bug fixes, copy, small features), use **EAS Update** so users get the new bundle on next launch without reinstalling.
- When you change only JS: run `eas update --branch production` (or similar). App (with `expo-updates` installed and configured) fetches the new bundle and runs it.
- **Limitation:** Native or Expo SDK changes still require a new APK; EAS Update does not replace full APK releases.

**Why optional:**

- Reduces how often you need to ask users to download a new APK for small fixes.
- Adds a dependency on EAS and a bit of config. You can adopt this after the “new version” check is in place.

### What would be implemented (after approval)

| Item | Work |
|------|------|
| **Backend (or static config)** | Endpoint or static JSON: e.g. `GET /app/config` or `GET /api/v1/app/version` returning `{ "android": { "version": "1.0.1", "downloadUrl": "https://...", "minVersion": "1.0.0" } }`. You update this when you release a new APK. |
| **Mobile** | On launch (and/or “Check for updates” in Settings): call the endpoint, compare versions, show “New version available” dialog with link to `downloadUrl`. |
| **EAS Update (optional)** | Add `expo-updates`, configure `app.json` with EAS project and channel/branch, run `eas update` when you want to ship a JS-only update. |

**Managing updates in practice:**

- **Full APK:** Bump version in `app.json` → build with EAS → upload APK to your URL → update backend version + `downloadUrl`. Users see the prompt when they open the app (or tap “Check for updates”).
- **OTA (if enabled):** Run `eas update --branch production` when you have a JS-only change; no backend change needed for that.

---

## Summary: Recommended choices

| Topic | Recommended method | Alternative / later |
|-------|--------------------|----------------------|
| **Notifications** | FCM + backend: app sends token to backend; backend sends push when events happen (e.g. listing approved). | Firebase Console manual sends; or third-party (OneSignal) later. |
| **Full app updates** | In-app version check: backend returns latest version + download URL; app shows “New version available” and opens URL. | Manual: user re-visits website to download new APK. |
| **JS-only updates** | Optional: EAS Update so small fixes go out without a new APK. | Rely only on full APK releases. |

---

## Approval

- [ ] **Part 1 (Notifications):** Approve FCM + backend as the method for push notifications.  
- [ ] **Part 2 (Updates):** Approve in-app “new version available” check with backend (or static) version/URL.  
- [ ] **Part 2 optional:** Approve adding EAS Update for OTA JS-only updates (can be done in a second phase).

Once you approve the parts you want, implementation can follow this plan without further design changes. If you want different options (e.g. different notification provider or update flow), say which parts to change before implementation.
