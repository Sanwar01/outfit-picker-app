import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/ui/screen";
import { ScreenSubtitle, ScreenTitle } from "@/components/ui/primitives";
import { Button } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/theme";

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const displayName = profile?.display_name ?? "Your profile";
  const vibes = profile?.style_vibes?.join(" & ") ?? "Not set";

  return (
    <Screen>
      <ScreenTitle>{`Hi, ${displayName.split(" ")[0]} 👋`}</ScreenTitle>
      <ScreenSubtitle>Here&apos;s your style journey</ScreenSubtitle>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{displayName}</Text>
        {profile?.location_city ? (
          <Text style={styles.meta}>{profile.location_city}</Text>
        ) : null}
        <Text style={styles.meta}>{vibes} style</Text>
      </View>

      <View style={styles.prefCard}>
        <Text style={styles.prefLabel}>Style vibe</Text>
        <Text style={styles.prefValue}>{vibes}</Text>
      </View>

      <Button
        title="Sign out"
        variant="outline"
        onPress={async () => {
          await signOut();
          router.replace("/(auth)/login");
        }}
        style={{ marginTop: 24 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  cardTitle: {
    fontFamily: "InstrumentSerif_400Regular",
    fontSize: 22,
    color: colors.ink,
  },
  meta: {
    marginTop: 4,
    fontSize: 14,
    color: colors.inkMuted,
    fontFamily: "DMSans_400Regular",
  },
  prefCard: {
    marginTop: 12,
    backgroundColor: colors.cream,
    borderRadius: 16,
    padding: 16,
  },
  prefLabel: {
    fontSize: 12,
    color: colors.inkFaint,
    fontFamily: "DMSans_500Medium",
  },
  prefValue: {
    marginTop: 4,
    fontSize: 15,
    color: colors.ink,
    fontFamily: "DMSans_600SemiBold",
  },
});
