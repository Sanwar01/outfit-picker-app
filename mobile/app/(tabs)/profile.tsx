import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth-context";
import {
  formatStyleVibesLabel,
  getProfileInitials,
} from "@/lib/profile-display";
import { colors, fonts, spacing } from "@/lib/theme";

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const displayName = profile?.display_name?.trim() || "Your profile";
  const firstName = displayName.split(/\s+/)[0] ?? displayName;
  const initials = getProfileInitials(profile?.display_name, user?.email ?? "");
  const vibes = profile?.style_vibes ?? [];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + spacing.tabBarHeight + 20,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.greeting}>Hi, {firstName}</Text>
      <Text style={styles.sub}>Your account</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.copy}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            {user?.email ? (
              <Text style={styles.meta} numberOfLines={1}>
                {user.email}
              </Text>
            ) : null}
            {profile?.location_city ? (
              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={12}
                  color={colors.inkMuted}
                />
                <Text style={styles.meta} numberOfLines={1}>
                  {profile.location_city}
                </Text>
              </View>
            ) : null}
            <Text style={styles.vibes} numberOfLines={2}>
              {formatStyleVibesLabel(vibes)}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.editBtn}
          onPress={() => router.push("/profile/edit")}
        >
          <Text style={styles.editBtnText}>Edit profile</Text>
        </Pressable>
      </View>

      <Button
        title="Sign out"
        variant="outline"
        onPress={async () => {
          await signOut();
          router.replace("/(auth)/login");
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  content: {
    paddingHorizontal: spacing.screen,
    gap: 16,
  },
  greeting: {
    fontFamily: fonts.serif,
    fontSize: 24,
    lineHeight: 28,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkMuted,
    marginTop: -10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    color: colors.ink,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 18,
    lineHeight: 22,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
    flexShrink: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  vibes: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    color: colors.inkMuted,
    marginTop: 6,
  },
  editBtn: {
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtnText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.ink,
  },
});
