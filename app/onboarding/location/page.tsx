import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingLocationStep } from "@/components/onboarding/onboarding-location-step";

export const dynamic = "force-dynamic";

export default async function OnboardingLocationPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    redirect("/login");
  }

  const userId = claimsData.claims.sub as string;
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", userId)
    .single();

  if (profile?.onboarding_complete) {
    redirect("/today");
  }

  return <OnboardingLocationStep userId={userId} />;
}
