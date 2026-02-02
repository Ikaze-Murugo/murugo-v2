# Rwanda Real Estate - Mobile App

## Overview

Cross-platform mobile application for Rwanda Real Estate Platform built with React Native and Expo.

## Tech Stack

- **Framework:** React Native with Expo
- **Navigation:** React Navigation
- **State Management:** Zustand
- **Data Fetching:** React Query
- **UI Library:** React Native Paper
- **Maps:** React Native Maps
- **Real-time:** Socket.io Client

## Prerequisites

- Node.js 18+ and npm
- **Expo SDK 54** – this project targets SDK 54 so it works with the current **Expo Go** app (App Store / Play Store).
- iOS Simulator (Mac only) or Android Studio for emulators
- **Expo Go** on your phone (recommended for development)

## Installation

1. Install dependencies:
```bash
npm install
```
   If you see peer dependency (ERESOLVE) errors, use:
   ```bash
   npm install --legacy-peer-deps
   ```

2. (Optional) Copy environment variables for local overrides:
```bash
cp .env.example .env
```

3. **API URL:** The app defaults to `https://api.murugohomes.com/api/v1`. To use a different backend (e.g. local), set in `.env`:
   - `EXPO_PUBLIC_API_URL=https://api.murugohomes.com/api/v1` (production)
   - `EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000/api/v1` (local dev)
   - `EXPO_PUBLIC_SOCKET_URL` for Socket.io (same host, no path)

## Development

Start the development server:
```bash
npm start
```

### Running the app (Expo Go – no EAS login needed)

For local development you **do not need to log in to Expo (EAS)**. Use **Expo Go** on your phone:

1. Install **Expo Go** from the App Store (iOS) or Play Store (Android).
2. After `npm start`, **scan the QR code** shown in the terminal with your phone’s camera (iOS) or with the Expo Go app (Android).
3. The app will load over your Wi‑Fi. Ensure your phone and computer are on the same network.

**Avoid:** Do not press `a` (Android) or `i` (iOS simulator) unless you have an emulator/device set up; that can trigger EAS login prompts. The QR code + Expo Go is enough for development.

### In-app sign-in (Login screen)

The app’s **Login** screen talks to your **backend API** (see `EXPO_PUBLIC_API_URL` in `.env`). Use the **same email and password** as on the web app (e.g. an account created at your deployed or local API). The “ApiV2Error” in the terminal is from **Expo’s EAS login**, not from your app’s backend—ignore it if you’re using Expo Go + QR code.

### Placeholder assets

The repo includes minimal placeholder PNGs for icon, splash, and related images so Metro can start. To regenerate them:

```bash
node scripts/create-placeholder-assets.js
```

Replace the files in `src/assets/images/` with real branding before release.

**If you see `EMFILE: too many open files`** (common on macOS), install Watchman so Metro uses one watcher instead of thousands of file handles:
```bash
brew install watchman
```
Then run `npm start` again. If you don’t use Homebrew, you can try raising the limit first: `ulimit -n 65536 && npm start`

Run on specific platform:
```bash
npm run android  # Android emulator/device
npm run ios      # iOS simulator (Mac only)
npm run web      # Web browser
```

## Building for Production

### Android (APK)
```bash
expo build:android
```

### iOS (IPA)
```bash
expo build:ios
```

### Using EAS Build (Recommended)
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## Project Structure

```
mobile/
├── src/
│   ├── api/             # API integration
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable components
│   ├── config/          # App configuration
│   ├── hooks/           # Custom React hooks
│   ├── navigation/      # Navigation setup
│   ├── screens/         # Screen components
│   ├── services/        # Business logic services
│   ├── store/           # State management
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── App.tsx          # Root component
├── __tests__/           # Test files
└── package.json
```

## Features

- User authentication (login, signup, OTP verification)
- Property browsing and search
- Property details with image gallery
- Map view of properties
- In-app messaging
- Favorites and saved searches
- User profile management
- Push notifications
- WhatsApp integration
- Social sharing

## Security / npm audit

After `npm install`, `npm audit` may report vulnerabilities. Most are in **dev/build tooling** (eslint, Expo CLI, React Native CLI, tar, send, etc.), not in the app code that runs on the device. Fixing all of them would require upgrading Expo and React Native (`npm audit fix --force`), which can introduce breaking changes.

- **Development:** Safe to run `npm start` and use the app; the reported issues do not affect normal development or the built APK’s runtime.
- **Optional:** Run `npm audit fix` (without `--force`) to apply non-breaking fixes. An override for `fast-xml-parser` is set to use a patched version.
- **Later:** When you upgrade Expo again, re-run `npm audit` and address any remaining advisories.

## Testing

Run tests:
```bash
npm test
```

## License

MIT
