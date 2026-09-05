import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BrandMark } from "@/components/atoms";
import { AuthFeatureGrid } from "../auth-feature-grid";
import { colors } from "@/lib/theme";
import { styles } from "./auth-hero.styles";

type AuthHeroProps = {
  headline: string;
  subheadline: string;
  showBack?: boolean;
  showFeatures?: boolean;
  featureVariant?: "login" | "signup";
};

export function AuthHero({
  headline,
  subheadline,
  showBack = false,
  showFeatures = true,
  featureVariant = "login",
}: AuthHeroProps) {
  return (
    <View style={styles.hero}>
      {showBack ? (
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
      ) : null}

      <BrandMark />

      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.subheadline}>{subheadline}</Text>

      {showFeatures ? <AuthFeatureGrid variant={featureVariant} /> : null}
    </View>
  );
}
