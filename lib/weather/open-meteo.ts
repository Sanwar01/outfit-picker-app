export interface WeatherSnapshot {
  temp_c: number;
  condition: string;
  precip_chance: number;
  city: string | null;
}

const WEATHER_CODE_LABELS: Record<number, string> = {
  0: "clear",
  1: "clear",
  2: "partly_cloudy",
  3: "cloudy",
  45: "foggy",
  48: "foggy",
  51: "drizzle",
  53: "drizzle",
  55: "drizzle",
  61: "rain",
  63: "rain",
  65: "rain",
  71: "snow",
  73: "snow",
  75: "snow",
  80: "rain",
  81: "rain",
  82: "rain",
  95: "storm",
};

export function weatherCodeToCondition(code: number): string {
  return WEATHER_CODE_LABELS[code] ?? "cloudy";
}

export function weatherConditionLabel(condition: string): string {
  return condition.replace(/_/g, " ");
}

export async function fetchWeather(
  lat: number,
  lng: number,
  city: string | null = null
): Promise<WeatherSnapshot> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("current", "temperature_2m,weather_code");
  url.searchParams.set(
    "daily",
    "precipitation_probability_max,temperature_2m_max,temperature_2m_min"
  );
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url.toString(), { next: { revalidate: 1800 } });
  if (!response.ok) {
    throw new Error("Failed to fetch weather");
  }

  const data = await response.json();
  const temp = data.current?.temperature_2m ?? 18;
  const code = data.current?.weather_code ?? 3;
  const precip = data.daily?.precipitation_probability_max?.[0] ?? 0;

  return {
    temp_c: Math.round(temp),
    condition: weatherCodeToCondition(code),
    precip_chance: precip,
    city,
  };
}
