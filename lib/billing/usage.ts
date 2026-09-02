import type { SupabaseClient } from "@supabase/supabase-js";
import { QuotaExceededError } from "@/lib/billing/errors";
import { getEntitlements } from "@/lib/billing/entitlements";
import {
  nextUtcDayStartIso,
  nextUtcMonthStartIso,
  utcDayKey,
  utcMonthKey,
} from "@/lib/billing/periods";
import {
  consumeCap,
  type PlanLimits,
  type UsageMeter,
} from "@/lib/billing/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/types/database";

type ConsumeResult = { ok: boolean; count: number };

function parseConsumeResult(data: Json | null): ConsumeResult {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, count: 0 };
  }
  const ok = data.ok === true;
  const count = typeof data.count === "number" ? data.count : 0;
  return { ok, count };
}

export async function getUsageCount(
  userId: string,
  meter: UsageMeter,
  periodKey: string,
): Promise<number> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("usage_counters")
    .select("count")
    .eq("user_id", userId)
    .eq("meter", meter)
    .eq("period_key", periodKey)
    .maybeSingle();

  return data?.count ?? 0;
}

export async function tryConsumeUsage(
  userId: string,
  meter: Exclude<UsageMeter, "wardrobe_items">,
  periodKey: string,
  limit: number | null,
): Promise<ConsumeResult> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("try_consume_usage", {
    p_user_id: userId,
    p_meter: meter,
    p_period_key: periodKey,
    p_limit: consumeCap(limit),
  });

  if (error) {
    console.error("try_consume_usage failed:", error);
    throw new Error("Failed to update usage quota");
  }

  return parseConsumeResult(data);
}

export async function countActiveWardrobeItems(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("clothing_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    console.error("countActiveWardrobeItems failed:", error);
    throw new Error("Failed to count wardrobe items");
  }

  return count ?? 0;
}

export async function assertAiTagQuota(userId: string): Promise<void> {
  const entitlements = await getEntitlements(createAdminClient(), userId);
  const limit = entitlements.limits.aiTagsPerMonth;
  const periodKey = utcMonthKey();

  const result = await tryConsumeUsage(userId, "ai_tags", periodKey, limit);

  if (!result.ok) {
    throw new QuotaExceededError({
      meter: "ai_tags",
      limit: limit ?? result.count,
      used: result.count,
      resetAt: nextUtcMonthStartIso(),
    });
  }
}

export async function assertWardrobeCapacity(
  supabase: SupabaseClient<Database>,
  userId: string,
  adding: number,
): Promise<void> {
  if (adding <= 0) return;

  const entitlements = await getEntitlements(supabase, userId);
  const limit = entitlements.limits.wardrobeItems;
  if (limit === null) return;

  const used = await countActiveWardrobeItems(supabase, userId);
  if (used + adding > limit) {
    throw new QuotaExceededError({
      meter: "wardrobe_items",
      limit,
      used,
      resetAt: null,
    });
  }
}

export function outfitMeterForRequest(
  isShuffle: boolean,
): "outfit_ai_daily" | "outfit_shuffle_daily" {
  return isShuffle ? "outfit_shuffle_daily" : "outfit_ai_daily";
}

export function outfitLimitForMeter(
  limits: PlanLimits,
  meter: "outfit_ai_daily" | "outfit_shuffle_daily",
): number | null {
  return meter === "outfit_shuffle_daily"
    ? limits.outfitShuffleDaily
    : limits.outfitAiDaily;
}

/**
 * Attempt to reserve one AI outfit generation. On failure, caller should use rules.
 * Does not throw QuotaExceededError (soft limit).
 */
export async function tryReserveOutfitAi(
  userId: string,
  isShuffle: boolean,
): Promise<{ allowed: boolean; meter: "outfit_ai_daily" | "outfit_shuffle_daily"; used: number; limit: number | null }> {
  const entitlements = await getEntitlements(createAdminClient(), userId);
  const meter = outfitMeterForRequest(isShuffle);
  const limit = outfitLimitForMeter(entitlements.limits, meter);
  const periodKey = utcDayKey();

  const result = await tryConsumeUsage(userId, meter, periodKey, limit);

  return {
    allowed: result.ok,
    meter,
    used: result.count,
    limit,
  };
}

export function outfitAiResetAt(): string {
  return nextUtcDayStartIso();
}
