import type { ClothingItem } from "@/lib/types/database";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";
import { weatherConditionLabel } from "@/lib/weather/open-meteo";

const NEUTRALS = new Set([
  "black",
  "white",
  "grey",
  "gray",
  "navy",
  "beige",
  "cream",
  "brown",
  "tan",
  "denim",
  "khaki",
  "charcoal",
  "olive",
]);

function daysSince(isoDate: string | null): number {
  if (!isoDate) return 999;
  const diff = Date.now() - new Date(isoDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formalityLabel(items: ClothingItem[]): string {
  const avg =
    items.reduce((sum, item) => sum + item.formality, 0) / items.length;
  if (avg >= 4) return "Polished and put-together";
  if (avg <= 2) return "Relaxed and easy";
  return "Smart casual and balanced";
}

function hasNeutralPalette(items: ClothingItem[]): boolean {
  return items.some((item) =>
    item.colors.some((color) => NEUTRALS.has(color.trim().toLowerCase()))
  );
}

export function buildWhyThisWorks(
  items: ClothingItem[],
  weather: WeatherSnapshot,
  styleVibes: string[] = []
): string[] {
  const reasons: string[] = [];

  reasons.push(`Perfect for ${weather.temp_c}°C weather`);

  if (weather.precip_chance >= 30) {
    reasons.push(
      `${weatherConditionLabel(weather.condition)} — layers suit the forecast`
    );
  }

  if (styleVibes.length > 0) {
    const vibeText =
      styleVibes.length === 1
        ? styleVibes[0]
        : `${styleVibes[0]} and ${styleVibes[1]}`;
    reasons.push(vibeText);
  } else {
    reasons.push(formalityLabel(items));
  }

  const freshest = [...items].sort(
    (a, b) => daysSince(b.last_worn_at) - daysSince(a.last_worn_at)
  )[0];

  if (freshest && daysSince(freshest.last_worn_at) >= 7) {
    const days = daysSince(freshest.last_worn_at);
    reasons.push(
      `You haven't worn this ${freshest.name.toLowerCase()} in ${days} days`
    );
  }

  reasons.push(
    hasNeutralPalette(items)
      ? "Balanced, clean colours"
      : "Colours work well together"
  );

  return [...new Set(reasons)].slice(0, 4);
}
