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
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac only) or Android Studio for emulators
- Expo Go app on your physical device (optional)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure your `.env` file with API URL and other credentials

## Development

Start the development server:
```bash
npm start
```

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

## Testing

Run tests:
```bash
npm test
```

## License

MIT
