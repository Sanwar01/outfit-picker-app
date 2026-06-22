import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { OutfitSuggestion } from "@/components/today/outfit-suggestion";
import { checkWardrobeReadiness } from "@/lib/today/wardrobe-readiness";
import { resolveWeatherBundle } from "@/lib/outfits/generate";
import { defaultWeatherBundle } from "@/lib/weather/open-meteo";
import { WeatherWidget } from "@/components/today/weather-widget";
import type { ClothingItem } from "@/lib/types/database";

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

  const userId = claimsData.claims.sub as string;

  const [{ data: profile }, { data: wardrobe }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("clothing_items")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active"),
  ]);

  const name = profile?.display_name ?? "there";
  const readiness = checkWardrobeReadiness((wardrobe ?? []) as ClothingItem[]);
  const hasLocation = profile?.location_lat != null;
  const weatherBundle = profile
    ? await resolveWeatherBundle(profile)
    : defaultWeatherBundle(null);
  const weather = weatherBundle.current;

  const subtitle =
    readiness.status === "ready"
      ? "What's the plan today?"
      : readiness.status === "empty"
        ? "Add a few pieces and I'll handle the rest"
        : "You're close — one more category to go";

  return (
    <AppShell>
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            {getGreeting()}, {name}
          </h1>
          <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
        </div>

        <WeatherWidget bundle={weatherBundle} hasLocation={hasLocation} />

        <OutfitSuggestion
          styleVibes={profile?.style_vibes ?? []}
          hasLocation={hasLocation}
          readiness={readiness}
          weather={weather}
        />
      </div>
    </AppShell>
  );
}
