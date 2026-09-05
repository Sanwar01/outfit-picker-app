import type { SupabaseClient } from "@supabase/supabase-js";
import { getEntitlements } from "@/lib/billing/entitlements";
import {
  nextUtcDayStartIso,
  nextUtcMonthStartIso,
  utcDayKey,
  utcMonthKey,
} from "@/lib/billing/periods";
import type { PlanId } from "@/lib/billing/plans";
import {
  countActiveWardrobeItems,
  getUsageCount,
} from "@/lib/billing/usage";
import type { Database } from "@/lib/types/database";

export type UsageMeterSnapshot = {
  meter: string;
  used: number;
  limit: number | null;
  remaining: number | null;
  resetAt: string | null;
};

export type UsageSnapshot = {
  plan: PlanId;
  wardrobe: UsageMeterSnapshot;
  aiTags: UsageMeterSnapshot;
  outfitAiDaily: UsageMeterSnapshot;
  outfitShuffleDaily: UsageMeterSnapshot;
};

function meterSnapshot(
  meter: string,
  used: number,
  limit: number | null,
  resetAt: string | null,
): UsageMeterSnapshot {
  const remaining =
    limit === null ? null : Math.max(0, limit - used);
  return { meter, used, limit, remaining, resetAt };
}

export async function getUsageSnapshot(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<UsageSnapshot> {
  const entitlements = await getEntitlements(supabase, userId);
  const { limits, plan } = entitlements;
  const dayKey = utcDayKey();
  const monthKey = utcMonthKey();

  const [wardrobeUsed, aiTagsUsed, outfitAiUsed, outfitShuffleUsed] =
    await Promise.all([
      countActiveWardrobeItems(supabase, userId),
      getUsageCount(userId, "ai_tags", monthKey),
      getUsageCount(userId, "outfit_ai_daily", dayKey),
      getUsageCount(userId, "outfit_shuffle_daily", dayKey),
    ]);

  return {
    plan,
    wardrobe: meterSnapshot(
      "wardrobe_items",
      wardrobeUsed,
      limits.wardrobeItems,
      null,
    ),
    aiTags: meterSnapshot(
      "ai_tags",
      aiTagsUsed,
      limits.aiTagsPerMonth,
      nextUtcMonthStartIso(),
    ),
    outfitAiDaily: meterSnapshot(
      "outfit_ai_daily",
      outfitAiUsed,
      limits.outfitAiDaily,
      nextUtcDayStartIso(),
    ),
    outfitShuffleDaily: meterSnapshot(
      "outfit_shuffle_daily",
      outfitShuffleUsed,
      limits.outfitShuffleDaily,
      nextUtcDayStartIso(),
    ),
  };
}
