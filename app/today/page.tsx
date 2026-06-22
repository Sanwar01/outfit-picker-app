import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { OutfitSuggestion } from "@/components/today/outfit-suggestion";

export const dynamic = "force-dynamic";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function TodayPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, location_city")
    .eq("id", claimsData.claims.sub as string)
    .single();

  const name = profile?.display_name ?? "there";

  return (
    <AppShell>
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-stone-900">
            {getGreeting()}, {name}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            What should you wear today?
          </p>
        </div>

        <OutfitSuggestion />
      </div>
    </AppShell>
  );
}
