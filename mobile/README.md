# Arena — Mobile App (Expo / React Native)

Android-first, "Duolingo for trading." Built UI-first on **mock data** — every screen
is interactive without the backend. The data layer (`src/api`) is a swappable seam:
flip `mockClient` → `httpClient` to talk to the real NestJS API later.

## Run it on your phone (Android)

1. Install **Expo Go** from the Play Store.
2. In this folder:
   ```bash
   npm install
   npx expo start --tunnel
   ```
   (`--tunnel` lets your phone connect even off the same network. First run may ask you
   to log in to a free Expo account and install `@expo/ngrok` — say yes.)
3. Scan the QR code with **Expo Go**. The app loads and hot-reloads on save.

> No Android Studio or emulator needed. iOS works too (`i`), but we're Android-first.

## What's here (mock data)

- **Onboarding → signup/login (email/Google/Apple, mocked) → profile setup**
- **Home** — streak, daily-goal ring, your competitions, friends activity
- **Trade** — live mock candlestick chart, instrument tabs, order ticket (long/short,
  leverage, margin/liq preview), open positions with live P&L, liquidations
- **Compete** — competitions list, create, join-by-code, competition leaderboards,
  weekly division with promote/relegate zones
- **Friends** — requests, friends, suggested, duel/add
- **Profile** — stats + achievements (tap an unlocked one for the celebration)
- Celebration overlay fires on your **first trade**

## Tech

Expo Router · TypeScript · custom theme (`src/theme`) + Nunito · react-native-svg charts ·
Zustand (session/trade/celebration) · TanStack Query · expo-haptics · reanimated.

## Project map

```
src/
  app/         routes (expo-router): (auth), (tabs), competition/[id], create-competition, join, division
  ui/          design system (Button, Card, Txt, ProgressRing, Avatar, …)
  features/    auth, trade, competitions, social, profile, common
  api/         client seam (mock now) + types mirroring the backend
  mock/        fixtures
  store/       zustand stores
  hooks/       query hooks
  theme/       tokens
  lib/         formatters
```

## Verify without a device

```bash
npx tsc --noEmit                              # types
npx expo export --platform android            # full Metro bundle (catches config/import errors)
```
