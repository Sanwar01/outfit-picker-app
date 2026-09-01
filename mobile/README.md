# Outfit Picker — Mobile

Expo (React Native) app that shares Supabase auth/storage with the Next.js web app and calls the existing Next.js API for AI features.

## Prerequisites

- Node.js 20+
- [Expo Go](https://expo.dev/go) on your phone, or Xcode / Android Studio for simulators
- Next.js dev server running (`npm run dev` from repo root)

## Setup

```bash
cd mobile
cp .env.example .env
```

Edit `mobile/.env`:

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Same as `NEXT_PUBLIC_SUPABASE_URL` in root `.env.local` |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Same as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| `EXPO_PUBLIC_API_URL` | Next.js API base URL |

**Physical device:** use your machine's LAN IP, not `localhost`:

```
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

## Run

Terminal 1 (API + web):

```bash
npm run dev
```

Terminal 2 (mobile):

```bash
cd mobile
npm start
```

Scan the QR code with Expo Go, or press `i` / `a` for iOS / Android simulator.

## Architecture

```
mobile/                    Expo Router app
  app/(tabs)/              Today, Wardrobe, Outfits, Profile
  app/(auth)/              Login / signup
  app/onboarding/          Onboarding stub (full flow on web for now)
  app/wardrobe/add         Photo upload → AI draft → review
  app/wardrobe/review/[id] Confirm AI tags before saving
  app/wardrobe/edit/[id]   Edit draft details before save
  lib/                     Supabase client, API wrapper, theme

../lib/types/              Shared TypeScript types (@shared/* alias)
../app/api/                Next.js API (Bearer token auth via route-client)
```

Mobile authenticates with Supabase directly (AsyncStorage session). API routes accept `Authorization: Bearer <token>` from mobile or cookies from web.

## Screens (v1)

- **Today** — AI outfit suggestion, shuffle, wear
- **Wardrobe** — grid of clothing items
- **Add** — photo upload, AI tagging, review & confirm before wardrobe save
- **Outfits** — saved outfits list + detail
- **Profile** — basic info + sign out

## Not yet ported

- Full onboarding (style vibes, goals, location)
- Outfit favorites toggle on mobile
- Push notifications, offline cache
