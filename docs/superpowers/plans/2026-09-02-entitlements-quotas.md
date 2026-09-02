# Entitlements & Quotas Phase 1 Implementation Plan

> **For agentic workers:** Execute task-by-task. Steps use checkbox syntax.

**Goal:** Enforce Free-plan wardrobe, AI tag, and outfit AI quotas server-side with a usage ledger.

**Architecture:** Code plan limits + `profiles.plan` + `usage_counters` + `try_consume_usage` RPC; hard 403 for tags/wardrobe; soft rules fallback for outfit AI.

**Tech Stack:** Supabase migrations, Next.js API routes, `createAdminClient`, Expo mobile error strings.

**Spec:** `docs/superpowers/specs/2026-09-02-entitlements-quotas-design.md`

## Global Constraints

- Free: 75 active items, 40 AI tags/month UTC, 1 AI Today/day UTC, 3 AI shuffles/day UTC
- Outfit over quota → rules fallback (200), not 403
- UTC periods; no Stripe/Family/paywall UI
- Commits only if user requests

---

### Task 1: Migration + types

**Files:**

- Create/edit: `supabase/migrations/20260902210236_entitlements_quotas.sql`
- Modify: `lib/types/database.ts`

- [ ] Add `profiles.plan`, `usage_counters`, RLS, `try_consume_usage` RPC
- [ ] Update Database types for plan, usage_counters, RPC

### Task 2: Billing lib

**Files:**

- Create: `lib/billing/plans.ts`, `errors.ts`, `entitlements.ts`, `usage.ts`, `periods.ts`

- [ ] Plan limits, period keys, quota error helpers, getEntitlements, tryConsume / countActiveWardrobe

### Task 3: Enforce tags + wardrobe

**Files:**

- Modify: `app/api/clothing/drafts/route.ts`, `tag/route.ts`, `drafts/[id]/confirm/route.ts`, `drafts/confirm-all/route.ts`
- Modify: `mobile/lib/api.ts` (+ add.tsx / bulk-review if needed for messages)

- [ ] Check/consume before tag+insert; wardrobe checks on confirm

### Task 4: Soft outfit AI quota

**Files:**

- Modify: `lib/outfits/generate.ts`

- [ ] Consume outfit meters before Gemini; allow shuffle AI under quota; rules when over

### Task 5: Verify

- [ ] `npx tsc --noEmit` (or project typecheck)
- [ ] Note migration needs `supabase db push` for remote
