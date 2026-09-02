export type PlanId = "free" | "pro" | "family";

export type UsageMeter =
  | "ai_tags"
  | "outfit_ai_daily"
  | "outfit_shuffle_daily"
  | "wardrobe_items";

export type PlanLimits = {
  /** Max active wardrobe items. null = unlimited */
  wardrobeItems: number | null;
  /** AI tags per UTC calendar month. null = unlimited */
  aiTagsPerMonth: number | null;
  /** First-of-day AI outfit gens per UTC day. null = unlimited */
  outfitAiDaily: number | null;
  /** Shuffle AI outfit gens per UTC day. null = unlimited */
  outfitShuffleDaily: number | null;
};

/** Large sentinel passed to try_consume_usage for "unlimited" meters. */
export const UNLIMITED_CONSUME_CAP = 1_000_000_000;

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    wardrobeItems: 75,
    aiTagsPerMonth: 40,
    outfitAiDaily: 1,
    outfitShuffleDaily: 3,
  },
  // Placeholders until Stripe — not exposed in UI yet
  pro: {
    wardrobeItems: null,
    aiTagsPerMonth: null,
    outfitAiDaily: null,
    outfitShuffleDaily: null,
  },
  family: {
    wardrobeItems: 500,
    aiTagsPerMonth: null,
    outfitAiDaily: null,
    outfitShuffleDaily: null,
  },
};

export function normalizePlanId(value: string | null | undefined): PlanId {
  if (value === "pro" || value === "family") return value;
  return "free";
}

export function consumeCap(limit: number | null): number {
  return limit ?? UNLIMITED_CONSUME_CAP;
}
