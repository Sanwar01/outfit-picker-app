import { apiGet } from "@/lib/api";

export type UsageMeterSnapshot = {
  meter: string;
  used: number;
  limit: number | null;
  remaining: number | null;
  resetAt: string | null;
};

export type UsageSnapshot = {
  plan: "free" | "pro" | "family";
  wardrobe: UsageMeterSnapshot;
  aiTags: UsageMeterSnapshot;
  outfitAiDaily: UsageMeterSnapshot;
  outfitShuffleDaily: UsageMeterSnapshot;
};

export async function fetchUsageSnapshot() {
  return apiGet<UsageSnapshot>("/api/billing/usage");
}

export function formatUsageFraction(meter: UsageMeterSnapshot): string {
  if (meter.limit === null) return "Unlimited";
  return `${meter.used} / ${meter.limit}`;
}

export function planLabel(plan: UsageSnapshot["plan"]): string {
  switch (plan) {
    case "pro":
      return "Pro";
    case "family":
      return "Family";
    default:
      return "Free";
  }
}
