import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BrandMark } from "@/components/brand/brand-mark";
import { AuthFeatureGrid } from "@/components/auth/auth-feature-grid";
import { colors, fonts } from "@/lib/theme";

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

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    boxShadow: "0px 2px 8px rgba(0,0,0,0.06)",
  },
  headline: {
    marginTop: 28,
    fontFamily: fonts.serif,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  subheadline: {
    marginTop: 10,
    marginBottom: 28,
    maxWidth: 280,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
  },
});
