# Omeetso Mobile (Expo)

This folder contains the **Omeetso** React Native application built with Expo and TypeScript. It is separate from the web preview at the parent repo root — do not mix files.

## Stack

- React Native `0.74.5`
- Expo SDK `~51`
- Expo Router `~3.5`
- TypeScript `~5.3`
- AsyncStorage, Safe Area Context, Gesture Handler, Reanimated
- Expo Image, Expo Image Picker, Expo Location, Expo Status Bar
- Lucide React Native icons

## Getting started

```bash
cd omeetso-mobile-expo
npm install
npx expo start
```

Then either:
- Press **a** to open Android emulator
- Press **i** to open iOS simulator (macOS + Xcode required)
- Scan the QR code with **Expo Go** on your phone

### Platform commands

```bash
npm run android    # expo start --android
npm run ios        # expo start --ios
npm run web        # expo start --web (limited; not the target)
npm run typecheck  # tsc --noEmit
```

## Project structure

```
omeetso-mobile-expo/
├── app/                    # Expo Router routes
│   ├── _layout.tsx         # Root stack + providers
│   ├── index.tsx           # Splash / boot routing
│   ├── +not-found.tsx
│   ├── (auth)/             # Language, onboarding, welcome, login, otp, profile, location
│   └── (tabs)/             # Home, Categories, Sell, Chats, Account
├── components/             # Reusable RN primitives (buttons, cards, banners, states)
├── constants/theme.ts      # Colors, spacing, radii, shadows, typography
├── data/                   # Mock data (products, categories, stores, users, chats, ads, notifications, locations)
├── storage/                # AsyncStorage service + storage keys
├── types/                  # Shared TypeScript models
├── app.json                # Expo config
├── package.json
├── tsconfig.json
├── babel.config.js
├── expo-env.d.ts
├── .env.example
└── .gitignore
```

## Backend status

This preview batch uses **mock data** with **AsyncStorage** for local persistence. There is no live backend yet. Wire real APIs in `services/` when they exist. Keys are centralised in `storage/keys.ts`:

```
omeetso_session, omeetso_language, omeetso_onboarding_completed,
omeetso_selected_location, omeetso_profile, omeetso_saved_products,
omeetso_recently_viewed, omeetso_user_listings, omeetso_user_stores,
omeetso_chat_threads, omeetso_offers, omeetso_notifications, omeetso_settings
```

## Environment variables

Copy `.env.example` to `.env` and fill in your local values:

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_MAPS_API_KEY=
```

Only variables prefixed with `EXPO_PUBLIC_` are exposed to the client. Never commit real secrets.

## Building for stores (EAS)

```bash
npx eas-cli login
npx eas build:configure
npx eas build --platform android
npx eas build --platform ios
```

## Notes

- **This project has not been executed inside Lovable** — Expo cannot run in the Lovable sandbox. Files are statically validated. Run `npm install && npx expo start` locally to verify.
- The existing web preview at the repo root is intentionally untouched.
- Only the **Omeetso** brand is used. No previous marketplace names appear anywhere.
