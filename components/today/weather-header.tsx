import {
  Cloud,
  CloudFog,
  CloudRain,
  CloudSun,
  Snowflake,
  Sun,
  Zap,
} from "lucide-react";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";
import { weatherConditionLabel } from "@/lib/weather/open-meteo";

function WeatherIcon({ condition }: { condition: string }) {
  const className = "h-4 w-4";
  switch (condition) {
    case "clear":
      return <Sun className={className} />;
    case "partly_cloudy":
      return <CloudSun className={className} />;
    case "rain":
    case "drizzle":
      return <CloudRain className={className} />;
    case "snow":
      return <Snowflake className={className} />;
    case "storm":
      return <Zap className={className} />;
    case "foggy":
      return <CloudFog className={className} />;
    default:
      return <Cloud className={className} />;
  }
}

export function WeatherHeader({ weather }: { weather: WeatherSnapshot }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <WeatherIcon condition={weather.condition} />
      <span>
        {weather.city ? `${weather.city} · ` : ""}
        {weather.temp_c}°C · {weatherConditionLabel(weather.condition)}
      </span>
      {weather.precip_chance >= 30 && (
        <span className="text-ink-faint">· {weather.precip_chance}% rain</span>
      )}
    </div>
  );
}
