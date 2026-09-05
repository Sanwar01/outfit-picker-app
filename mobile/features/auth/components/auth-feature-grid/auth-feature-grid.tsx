import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { authFeatures, type AuthFeatureIcon } from "@/theme/brand";
import { styles } from "./auth-feature-grid.styles";

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
