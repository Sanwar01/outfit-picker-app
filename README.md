# Outfit Picker

AI-powered digital wardrobe and personal stylist. Phase 1: upload clothes, AI auto-tagging, and wardrobe management.

## Stack

- Next.js 16 (App Router)
- Supabase (Auth, Postgres, Storage)
- Google Gemini (vision tagging, free tier via AI Studio)
- Tailwind CSS + shadcn/ui

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com) named `outfit-picker`
2. Run migrations in `supabase/migrations/` via SQL Editor or:

```bash
supabase link --project-ref <your-ref>
supabase db push
```

This applies all migrations (Phase 1 schema, username column, Phase 2 outfits).

1. Configure Auth email template (only needed if Google OAuth is enabled):

```html
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/onboarding
```

1. (Optional) Enable Google OAuth in Authentication > Providers
2. **Disable email confirmation** (optional for dev): Authentication > Providers > Email → turn off "Confirm email" so users can sign in immediately after signup

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Optional Gemini model overrides (defaults to `gemini-2.0-flash`):

```bash
GEMINI_OUTFIT_MODEL=gemini-2.0-flash
GEMINI_TAG_MODEL=gemini-2.0-flash
```

Avoid `gemini-2.5-flash-lite` on the free tier — it often returns 503 under load. Outfit generation retries on transient errors and falls back to rules-based picks when AI is unavailable.

Get a free API key at [Google AI Studio](https://aistudio.google.com/apikey).

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Phase 2 features

- **Today** tab with weather-aware outfit suggestions
- AI outfit generator (Gemini) with shuffle, save, and wear logging
- Saved outfits with favorites

## Phase 1 features

- Email + password sign-up and sign-in
- Optional Google OAuth
- 2-step onboarding (style vibes + location)
- Batch clothing photo upload with client-side compression
- AI auto-tagging (name, category, colors, pattern, season, formality)
- Wardrobe grid with search and category filters
- Archive, delete, edit, and re-tag items

## Phase 3 (not yet built)

- Closet gap analysis and style insights

## Phase 2 setup

Migrations are included in the main `supabase db push` step above. If you set up Phase 1 before Phase 2 was added, run `supabase db push` again to apply outfit tables.

Set your location in **Profile** (or during onboarding) for accurate weather.
