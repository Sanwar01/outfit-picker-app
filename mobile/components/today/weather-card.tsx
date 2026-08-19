import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { WeatherSnapshot } from "@shared/types/weather";
import { colors, fonts } from "@/lib/theme";

function weatherIcon(condition: string): keyof typeof Ionicons.glyphMap {
  const c = condition.toLowerCase();
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower"))
    return "rainy-outline";
  if (c.includes("thunder") || c.includes("storm")) return "thunderstorm-outline";
  if (c.includes("snow") || c.includes("sleet") || c.includes("blizzard"))
    return "snow-outline";
  if (c.includes("fog") || c.includes("mist") || c.includes("haze"))
    return "cloudy-outline";
  if (c.includes("cloud") || c.includes("overcast")) return "cloudy-outline";
  if (c.includes("partly") || c.includes("some")) return "partly-sunny-outline";
  return "sunny-outline";
}

function conditionLabel(condition: string) {
  return condition.replace(/_/g, " ").toLowerCase();
}

type WeatherCardProps = {
  weather: WeatherSnapshot;
  highC?: number;
  lowC?: number;
  onLocationPress?: () => void;
};

export function WeatherCard({
  weather,
  highC,
  lowC,
  onLocationPress,
}: WeatherCardProps) {
  const icon = weatherIcon(weather.condition);
  const showRain = weather.precip_chance >= 25;
  const locationRow = (
    <>
      <Ionicons name="location-outline" size={14} color={colors.inkMuted} />
      <Text style={styles.city} numberOfLines={1}>
        {(weather.city ?? "Your city").toUpperCase()}
      </Text>
    </>
  );

  return (
    <View style={styles.card}>
      {onLocationPress ? (
        <Pressable style={styles.location} onPress={onLocationPress}>
          {locationRow}
        </Pressable>
      ) : (
        <View style={styles.location}>{locationRow}</View>
      )}

      <View style={styles.mid}>
        <Text style={styles.tempLine}>
          <Text style={styles.temp}>{Math.round(weather.temp_c)}°C</Text>
          <Text style={styles.condition}>
            , {conditionLabel(weather.condition)}
          </Text>
        </Text>
        <Ionicons name={icon} size={36} color={colors.ink} />
      </View>

      {(highC != null || lowC != null) && (
        <Text style={styles.hilo}>
          {highC != null ? `H ${Math.round(highC)}°` : ""}
          {highC != null && lowC != null ? " · " : ""}
          {lowC != null ? `L ${Math.round(lowC)}°` : ""}
        </Text>
      )}

      {showRain && (
        <View style={styles.precipChip}>
          <Ionicons name="umbrella-outline" size={14} color={colors.ink} />
          <Text style={styles.precipText}>
            {Math.round(weather.precip_chance)}% chance of rain
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  city: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    letterSpacing: 1.4,
    color: colors.ink,
    flexShrink: 1,
  },
  mid: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  tempLine: {
    flex: 1,
    flexShrink: 1,
  },
  temp: {
    fontFamily: fonts.sansSemi,
    fontSize: 24,
    lineHeight: 30,
    color: colors.ink,
  },
  condition: {
    fontFamily: fonts.sans,
    fontSize: 24,
    lineHeight: 30,
    color: colors.inkMuted,
  },
  hilo: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    marginTop: 8,
  },
  precipChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    alignSelf: "flex-start",
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  precipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.ink,
  },
});
