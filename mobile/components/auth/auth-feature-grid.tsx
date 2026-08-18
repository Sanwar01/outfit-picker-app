import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { authFeatures, type AuthFeatureIcon } from "@/lib/brand";
import { colors, fonts, radius } from "@/lib/theme";

const FEATURE_ICONS: Record<AuthFeatureIcon, keyof typeof Ionicons.glyphMap> = {
  shirt: "shirt-outline",
  sparkles: "sparkles-outline",
  weather: "partly-sunny-outline",
};

type AuthFeatureGridProps = {
  variant?: "login" | "signup";
};

export function AuthFeatureGrid({ variant = "login" }: AuthFeatureGridProps) {
  return (
    <View style={styles.grid}>
      {authFeatures.map((feature) => (
        <View key={feature.id} style={styles.item}>
          <View style={styles.tile}>
            <Ionicons
              name={FEATURE_ICONS[feature.icon]}
              size={20}
              color="#5c534a"
            />
          </View>
          {variant === "signup" ? (
            <Text style={styles.label}>
              <Text style={styles.emphasis}>{feature.emphasis}</Text>
              {` ${feature.rest}`}
            </Text>
          ) : (
            <Text style={styles.label}>{feature.label}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: 12,
  },
  item: {
    flex: 1,
    alignItems: "center",
  },
  tile: {
    width: 48,
    height: 48,
    borderRadius: radius.tile,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 2px 8px rgba(0,0,0,0.06)",
  },
  label: {
    marginTop: 8,
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
    color: colors.inkMuted,
  },
  emphasis: {
    fontFamily: fonts.sansSemi,
    color: colors.ink,
  },
});
