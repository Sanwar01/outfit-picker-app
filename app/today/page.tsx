import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { OutfitSuggestion } from "@/components/today/outfit-suggestion";
import { TodayHeader } from "@/components/today/today-header";
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

  const items = (wardrobe ?? []) as ClothingItem[];
  const name = profile?.display_name ?? "there";
  const readiness = checkWardrobeReadiness(items);
  const hasLocation = profile?.location_lat != null;
  const weatherBundle = profile
    ? await resolveWeatherBundle(profile)
    : defaultWeatherBundle(null);
  const subtitle =
    readiness.status === "ready"
      ? "Here's what I recommend for you today"
      : readiness.status === "empty"
        ? "Add a few pieces and I'll handle the rest"
        : "You're close — one more category to go";

  return (
    <AppShell>
      <div className="px-4 py-5">
        <TodayHeader
          greeting={`${getGreeting()}, ${name} 👋`}
          subtitle={subtitle}
        />

        <WeatherWidget bundle={weatherBundle} hasLocation={hasLocation} />

        <OutfitSuggestion
          styleVibes={profile?.style_vibes ?? []}
          readiness={readiness}
        />
      </div>
    </AppShell>
  );
}
