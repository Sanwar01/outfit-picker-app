import type { WeatherDetail } from "@/lib/weather/open-meteo";

const RAINY_CONDITIONS = new Set(["rain", "drizzle", "storm"]);

export function shouldShowRainBadge(weather: WeatherDetail): boolean {
  return (
    weather.precip_chance >= 25 ||
    RAINY_CONDITIONS.has(weather.condition)
  );
}

export function rainBadgeLabel(weather: WeatherDetail): string {
  if (weather.precip_chance >= 25) {
    return `${weather.precip_chance}% chance of rain`;
  }
  return "Rain in the forecast";
}

export function rainConditionHint(weather: WeatherDetail): string | null {
  if (!shouldShowRainBadge(weather)) return null;

  if (weather.precip_chance >= 50 || weather.condition === "rain") {
    return "Rain likely later";
  }
  if (weather.precip_chance >= 25 || weather.condition === "drizzle") {
    return "Light rain later";
  }
  if (weather.condition === "storm") {
    return "Storms possible later";
  }
  return "Showers possible later";
}
