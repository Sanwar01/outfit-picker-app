import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StyleStep } from "@/components/onboarding/style-step";
import type { OnboardingAudience, StyleGoalId } from "@/lib/onboarding/constants";
import type { StyleVibe } from "@/lib/types/clothing";

export const dynamic = "force-dynamic";

async function getOnboardingContext() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    redirect("/login");
  }

  const userId = claimsData.claims.sub as string;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profile?.onboarding_complete) {
    redirect("/today");
  }

  return { userId, profile };
}

export default async function OnboardingPage() {
  const { userId, profile } = await getOnboardingContext();

  return (
    <StyleStep
      userId={userId}
      initialVibes={(profile?.style_vibes ?? []) as StyleVibe[]}
      initialGoals={(profile?.style_goals ?? []) as StyleGoalId[]}
      initialAudience={
        (profile?.onboarding_audience as OnboardingAudience | null) ?? "self"
      }
    />
  );
}
