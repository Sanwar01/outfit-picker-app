import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { WeatherSnapshot } from '@shared/types/weather';
import { colors, fonts, radius } from '@/lib/theme';

/** Map API condition strings to Ionicon names */
function weatherIcon(condition: string): keyof typeof Ionicons.glyphMap {
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower'))
    return 'rainy-outline';
  if (c.includes('thunder') || c.includes('storm'))
    return 'thunderstorm-outline';
  if (c.includes('snow') || c.includes('sleet') || c.includes('blizzard'))
    return 'snow-outline';
  if (c.includes('fog') || c.includes('mist') || c.includes('haze'))
    return 'cloudy-night-outline';
  if (c.includes('cloud') || c.includes('overcast')) return 'cloudy-outline';
  if (c.includes('partly') || c.includes('some')) return 'partly-sunny-outline';
  return 'sunny-outline';
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

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Pressable style={styles.location} onPress={onLocationPress}>
          <Ionicons name="location-outline" size={13} color={colors.brand} />
          <Text style={styles.city} numberOfLines={1}>
            {(weather.city ?? 'Your location').toUpperCase()}
          </Text>
          <Ionicons name="chevron-forward" size={13} color={colors.inkFaint} />
        </Pressable>

        <Ionicons name={icon} size={48} color={colors.inkFaint} />
      </View>

      <View style={styles.mid}>
        <Text style={styles.temp}>{Math.round(weather.temp_c)}°C</Text>
        <Text style={styles.condition}>{weather.condition}</Text>
      </View>

      {(highC != null || lowC != null) && (
        <Text style={styles.hilo}>
          {highC != null ? `H ${Math.round(highC)}°` : ''}
          {highC != null && lowC != null ? ' · ' : ''}
          {lowC != null ? `L ${Math.round(lowC)}°` : ''}
        </Text>
      )}

      {weather.precip_chance > 0 && (
        <View style={styles.precipChip}>
          <Ionicons name="umbrella-outline" size={12} color={colors.inkMuted} />
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
    borderRadius: radius.tile ?? 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    paddingRight: 8,
  },
  city: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.inkMuted,
    flexShrink: 1,
  },
  mid: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  temp: {
    fontFamily: fonts.serif,
    fontSize: 36,
    lineHeight: 42,
    color: colors.ink,
  },
  condition: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.inkMuted,
    flexShrink: 1,
  },
  hilo: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 4,
  },
  precipChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: colors.cream,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  precipText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
  },
});
