import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/ui/screen";
import { ScreenSubtitle, ScreenTitle } from "@/components/ui/primitives";
import { Button } from "@/components/ui/primitives";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/theme";

export default function OnboardingScreen() {
  const { user, refreshProfile } = useAuth();

  async function completeForNow() {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ onboarding_complete: true })
      .eq("id", user.id);
    await refreshProfile();
    router.replace("/(tabs)/today");
  }

  return (
    <Screen>
      <ScreenTitle>Let&apos;s set up your style</ScreenTitle>
      <ScreenSubtitle>
        Complete onboarding on web for now, or skip to explore the app.
      </ScreenSubtitle>

      <View style={styles.card}>
        <Text style={styles.body}>
          Full onboarding (style vibes, wardrobe upload, location) will be ported
          in the next sprint. The mobile shell is ready.
        </Text>
      </View>

      <Button
        title="Continue to app"
        onPress={completeForNow}
        style={{ marginTop: 24 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    backgroundColor: colors.cream,
    borderRadius: 16,
    padding: 16,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    fontFamily: "DMSans_400Regular",
  },
});
