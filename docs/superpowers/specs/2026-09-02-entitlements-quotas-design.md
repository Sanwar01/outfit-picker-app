# Entitlements & Quotas — Phase 1 Design

**Date:** 2026-09-02  
**Status:** Approved for implementation planning  
**Scope:** Free-plan server-side limits (no Stripe, Family, or paywall UI)

## Goal

Protect Gemini spend and create a monetization foundation by enforcing Free-tier limits in Next.js API routes. Billing Gemini separately removes provider rate limits; app quotas remain the product control.

## Decisions

| Topic | Decision |
| ------- | ---------- |
| Approach | Code-defined plan limits + `usage_counters` table; enforce in API |
| Outfit AI over quota | Soft: skip Gemini, use local rules, still return `200` |
| Wardrobe / AI tags over quota | Hard: `403` with `quota_exceeded` payload |
| Billing | Out of scope (everyone is `free` until Stripe) |
| Family / Pro UI | Out of scope |

## Free limits

| Meter | Limit | Period | Enforcement |
| ------- | ------- | -------- | ------------- |
| Active wardrobe items | 75 | — | Live `COUNT` of `clothing_items` where `status = 'active'` |
| AI tags | 40 | Calendar month (`YYYY-MM`) | Counter before Gemini tagging |
| First AI Today pick | 1 | Calendar day (`YYYY-MM-DD`) | Counter only when Gemini runs for non-shuffle generate |
| Shuffle AI gens | 3 | Calendar day (`YYYY-MM-DD`) | Counter only when Gemini runs for shuffle (`excludeCombinations.length > 0`) |

Pro/Family limit tables live in the same code module as stubs or comments so Stripe can flip `profiles.plan` later without redesigning meters.

## Data model

### `profiles.plan`

- Column: `plan text not null default 'free'`
- Allowed values for now: `'free'` (future: `'pro'`, `'family'`)
- Existing users get `'free'` via default / backfill

### `usage_counters`

| Column | Type | Notes |
| -------- | ------ | -------- |
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users | cascade delete |
| `meter` | text | e.g. `ai_tags`, `outfit_ai_daily`, `outfit_shuffle_daily` |
| `period_key` | text | `YYYY-MM` or `YYYY-MM-DD` |
| `count` | int not null default 0 | |
| `updated_at` | timestamptz | |

Unique: `(user_id, meter, period_key)`.

**RLS:** users can `SELECT` own rows. Inserts/updates only via service role or a `security definer` RPC used by the API (client must not bump counters).

### Meter names

- `ai_tags`
- `outfit_ai_daily` — first-of-day / non-shuffle AI generate
- `outfit_shuffle_daily` — generate with exclusions

Wardrobe size is **not** a counter; it is counted from `clothing_items` at check time.

## Application modules

Suggested layout (adjust to match repo conventions):

- `lib/billing/plans.ts` — plan → limit map (Free numbers above; Pro/Family placeholders)
- `lib/billing/entitlements.ts` — `getEntitlements(userId)` from `profiles.plan` + plan limits
- `lib/billing/usage.ts` — `getUsage`, `tryConsume(meter)`, `assertWithinLimit` helpers using `createAdminClient()` (`lib/supabase/admin`)
- `lib/billing/errors.ts` — shared `quota_exceeded` JSON shape + helper to build `NextResponse`

Quota writes use the existing admin (service-role) client. Do not trust the user JWT for counter increments. Prefer an atomic SQL upsert/RPC (`increment if count < limit`) so concurrent tags cannot overshoot.

## API enforcement

### 1. AI tagging (hard)

**Routes / helpers:** `POST /api/clothing/drafts` → `runDraftTagging`, and `POST /api/clothing/tag`

Before calling Gemini:

1. Attempt atomic consume of `ai_tags` for current `YYYY-MM` (or check-then-increment via RPC)
2. If at limit → do **not** call Gemini; return `403` quota_exceeded from the route (for drafts POST: after insert is allowed only if we already inserted — prefer **check before insert**, or insert then skip tagging and return draft with a flag; **Phase 1 choice: check quota before insert + tagging** so over-quota users get 403 and no new draft)
3. On successful Gemini tag → counter already consumed (or confirm increment)
4. If Gemini throws after consume → leave increment (paid attempt) **or** decrement on hard failure; **Phase 1 choice: leave increment** (simpler; avoids refund races)

`resetAt` for this meter: first instant of next UTC month.

### 2. Wardrobe size (hard)

**Routes:** `POST /api/clothing/drafts/[id]/confirm`, `POST /api/clothing/drafts/confirm-all`

Before promoting draft(s) to `active`:

1. Count current items with `status = 'active'` for the user (drafts marked via notes do not count until confirmed)
2. Confirm-one: if `active + 1 > limit` → `403` meter `wardrobe_items`
3. Confirm-all: if `active + draftCount > limit` → `403` (do not partially confirm in Phase 1)
4. Else confirm

Deleting/archiving frees capacity (live count). No `resetAt`.

### 3. Outfit generation (soft)

**Route:** `POST /api/outfits/generate` → `generateOutfitForUser`

1. Determine meter: shuffle if `excludeCombinations.length > 0`, else `outfit_ai_daily`
2. If usage ≥ limit **or** plan forces rules-only → do not call Gemini; use existing local rules path (`generated_by: 'rules'`)
3. If under limit and Gemini runs successfully → increment the meter
4. Cached first-of-day hit: do not increment again (cache already avoids Gemini)

Always return a successful outfit when wardrobe allows generation today; never hard-fail solely for outfit AI quota.

Optional response extras (Phase 1 nice-to-have): `quota` object with `meter`, `used`, `limit`, `aiAllowed` so mobile can show “3 AI shuffles left” later without a second endpoint.

## Error shape

```json
{
  "error": "quota_exceeded",
  "meter": "ai_tags",
  "limit": 40,
  "used": 40,
  "resetAt": "2026-10-01T00:00:00.000Z"
}
```

HTTP status: **403**.

`resetAt`: start of next month (tags) or next UTC/local day (daily meters — pick **UTC** for Phase 1 and document it). Wardrobe has no `resetAt` (omit or null); user must delete/archive or upgrade.

## Mobile (minimal)

- No upgrade / paywall screens in Phase 1
- Handle `quota_exceeded` on draft create / confirm with a clear alert
- Outfit generate continues to work; no change required beyond optional display of `generated_by`

## Out of scope

- Stripe / RevenueCat / App Store IAP
- Family seats and pooled counters
- Stylist, try-on, insights, shopping meters
- Paywall UI and Pro marketing copy
- Changing Free limits via admin UI (code constants only)

## Success criteria

1. Free user with 75 active items cannot confirm another draft (403)
2. Free user cannot run more than 40 successful AI tags in a calendar month
3. After 1 AI Today + 3 AI shuffles in a day, further generates use rules and do not call Gemini
4. Counter increments are atomic enough to avoid easy double-spend under concurrent requests (upsert + check, or RPC)
5. `profiles.plan` exists so Pro can be enabled later by setting the column

## Future (not Phase 1)

- Stripe webhook sets `profiles.plan` to `pro` / `family`
- Same meters; higher limits from `plans.ts`
- Family: `family_id` on counters or separate household pool
- `GET /api/billing/usage` for Profile settings
