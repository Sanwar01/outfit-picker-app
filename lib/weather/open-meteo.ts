export interface WeatherSnapshot {
  temp_c: number;
  condition: string;
  precip_chance: number;
  city: string | null;
}

export interface WeatherDetail extends WeatherSnapshot {
  weather_code: number;
  high_c: number;
  low_c: number;
}

export interface ForecastDay {
  date: string;
  day_label: string;
  date_label: string;
  condition: string;
  description: string;
  weather_code: number;
  high_c: number;
  low_c: number;
  precip_chance: number;
}

export interface WeatherBundle {
  current: WeatherDetail;
  forecast: ForecastDay[];
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

const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast clouds",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
};

export function weatherCodeToCondition(code: number): string {
  return WEATHER_CODE_LABELS[code] ?? "cloudy";
}

export function weatherCodeToDescription(code: number): string {
  return WEATHER_CODE_DESCRIPTIONS[code] ?? "Cloudy";
}

export function weatherConditionLabel(condition: string): string {
  return condition.replace(/_/g, " ");
}

function formatDayLabel(isoDate: string): { day: string; date: string } {
  const parsed = new Date(`${isoDate}T12:00:00`);
  const day = parsed.toLocaleDateString("en-GB", { weekday: "short" });
  const date = parsed.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
  return { day, date };
}

function parseForecastDay(
  isoDate: string,
  code: number,
  high: number,
  low: number,
  precip: number
): ForecastDay {
  const { day, date } = formatDayLabel(isoDate);
  return {
    date: isoDate,
    day_label: day,
    date_label: date,
    condition: weatherCodeToCondition(code),
    description: weatherCodeToDescription(code),
    weather_code: code,
    high_c: Math.round(high),
    low_c: Math.round(low),
    precip_chance: precip,
  };
}

export function defaultWeatherBundle(city: string | null = null): WeatherBundle {
  const current: WeatherDetail = {
    temp_c: 18,
    condition: "cloudy",
    precip_chance: 20,
    city,
    weather_code: 3,
    high_c: 22,
    low_c: 14,
  };

  const forecast: ForecastDay[] = Array.from({ length: 5 }, (_, index) => {
    const d = new Date();
    d.setDate(d.getDate() + index);
    const iso = d.toISOString().slice(0, 10);
    const labels = formatDayLabel(iso);
    return {
      date: iso,
      day_label: labels.day,
      date_label: labels.date,
      condition: "cloudy",
      description: "Overcast clouds",
      weather_code: 3,
      high_c: 20,
      low_c: 14,
      precip_chance: 20,
    };
  });

  return { current, forecast };
}

export async function fetchWeatherDetail(
  lat: number,
  lng: number,
  city: string | null = null
): Promise<WeatherBundle> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("current", "temperature_2m,weather_code");
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
  );
  url.searchParams.set("forecast_days", "5");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url.toString(), { next: { revalidate: 1800 } });
  if (!response.ok) {
    throw new Error("Failed to fetch weather");
  }

  const data = await response.json();
  const temp = data.current?.temperature_2m ?? 18;
  const code = data.current?.weather_code ?? 3;
  const times: string[] = data.daily?.time ?? [];
  const codes: number[] = data.daily?.weather_code ?? [];
  const highs: number[] = data.daily?.temperature_2m_max ?? [];
  const lows: number[] = data.daily?.temperature_2m_min ?? [];
  const precips: number[] = data.daily?.precipitation_probability_max ?? [];

  const forecast = times.slice(0, 5).map((isoDate, index) =>
    parseForecastDay(
      isoDate,
      codes[index] ?? 3,
      highs[index] ?? temp,
      lows[index] ?? temp,
      precips[index] ?? 0
    )
  );

  const todayHigh = highs[0] ?? temp;
  const todayLow = lows[0] ?? temp;
  const todayPrecip = precips[0] ?? 0;

  return {
    current: {
      temp_c: Math.round(temp),
      condition: weatherCodeToCondition(code),
      precip_chance: todayPrecip,
      city,
      weather_code: code,
      high_c: Math.round(todayHigh),
      low_c: Math.round(todayLow),
    },
    forecast,
  };
}

export async function fetchWeather(
  lat: number,
  lng: number,
  city: string | null = null
): Promise<WeatherSnapshot> {
  const bundle = await fetchWeatherDetail(lat, lng, city);
  return bundle.current;
}
