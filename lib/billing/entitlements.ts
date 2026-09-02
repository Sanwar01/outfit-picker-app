import type { SupabaseClient } from "@supabase/supabase-js";
import {
  normalizePlanId,
  PLAN_LIMITS,
  type PlanId,
  type PlanLimits,
} from "@/lib/billing/plans";
import type { Database } from "@/lib/types/database";

export type Entitlements = {
  plan: PlanId;
  limits: PlanLimits;
};

export async function getEntitlements(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Entitlements> {
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  const plan = normalizePlanId(
    (data as { plan?: string } | null)?.plan ?? "free",
  );

  return {
    plan,
    limits: PLAN_LIMITS[plan],
  };
}
