import type { OutfitSlot } from "@/lib/ai/outfit-rules";
import { CATEGORY_LABELS } from "@/lib/types/clothing";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";
import { weatherConditionLabel } from "@/lib/weather/open-meteo";

function slotLabel(slot: OutfitSlot, plural = true): string {
  const label = CATEGORY_LABELS[slot].toLowerCase();
  return plural ? `${label}s` : label;
}

export function missingSlotsGuidance(missing: OutfitSlot[]): string {
  if (missing.length === 1) {
    return `Add a ${slotLabel(missing[0], false)} and I can build full looks for you.`;
  }
  const labels = missing.map((slot) => slotLabel(slot, false));
  const last = labels.pop();
  return `Add ${labels.join(", ")} and a ${last} — then I'll handle the rest.`;
}

export function missingSlotsHeadline(missing: OutfitSlot[]): string {
  if (missing.length === 1) {
    return `Almost there — just need ${slotLabel(missing[0], false)}`;
  }
  return "A few more pieces to go";
}

export function buildPersonalizationLine(
  styleVibes: string[],
  weather: WeatherSnapshot,
  hasLocation: boolean,
  options: { includeWeather?: boolean } = {}
): string {
  const includeWeather = options.includeWeather ?? true;
  const parts: string[] = [];

  if (styleVibes.length > 0) {
    const vibeText =
      styleVibes.length === 1
        ? styleVibes[0]
        : `${styleVibes[0]} & ${styleVibes[1]}`;
    parts.push(vibeText);
  }

  if (includeWeather) {
    if (hasLocation && weather.city) {
      parts.push(
        `${weather.temp_c}° in ${weather.city} · ${weatherConditionLabel(weather.condition)}`
      );
    } else if (hasLocation) {
      parts.push(
        `${weather.temp_c}° · ${weatherConditionLabel(weather.condition)}`
      );
    }
  }

  if (parts.length === 0) {
    return "Picked from what you own";
  }

  return parts.join(" · ");
}

export function mapGenerateError(message: string): {
  title: string;
  body: string;
} {
  const lower = message.toLowerCase();

  if (
    lower.includes("add ") &&
    (lower.includes("wardrobe") || lower.includes("i'll take care"))
  ) {
    return {
      title: "Almost ready",
      body: message,
    };
  }

  if (lower.includes("weather") || lower.includes("suitable")) {
    return {
      title: "Tricky weather today",
      body: "Nothing in your closet quite fits the forecast. Try adding a layer or different shoes.",
    };
  }

  return {
    title: "Couldn't put a look together",
    body: "Give it another try, or add a few more pieces to your wardrobe.",
  };
}
