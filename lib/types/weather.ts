export interface WeatherSnapshot {
  temp_c: number;
  condition: string;
  precip_chance: number;
  city: string | null;
}
