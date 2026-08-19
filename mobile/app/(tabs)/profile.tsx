import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button } from "@/components/ui/primitives";
import { ComingSoonBadge } from "@/components/profile/coming-soon-badge";
import { ProfileMenuRow } from "@/components/profile/menu-row";
import { useAuth } from "@/lib/auth-context";
import {
  formatStyleVibesLabel,
  getProfileInitials,
  profileTagline,
} from "@/lib/profile-display";
import { colors, fonts, spacing } from "@/lib/theme";

const MENU = [
  {
    icon: "bookmark-outline" as const,
    title: "Saved items",
    description: "Outfits, items and inspiration",
    href: "/(tabs)/outfits" as const,
  },
  {
    icon: "calendar-outline" as const,
    title: "Style calendar",
    description: "See what you wore and plan ahead",
  },
  {
    icon: "stats-chart-outline" as const,
    title: "Stats & insights",
    description: "Your wardrobe and style overview",
  },
  {
    icon: "heart-outline" as const,
    title: "Liked outfits",
    description: "Your favourite outfit combinations",
  },
  {
    icon: "bag-handle-outline" as const,
    title: "Shopping list",
    description: "Items you want to buy",
  },
  {
    icon: "body-outline" as const,
    title: "My measurements",
    description: "Keep your sizing up to date",
  },
];

const ACHIEVEMENTS = [
  {
    title: "Wardrobe Starter",
    detail: "Added 10 items",
    icon: "shirt-outline" as const,
    background: "#f3e4d4",
  },
  {
    title: "Consistent",
    detail: "Used app for 7 days",
    icon: "calendar-outline" as const,
    background: "#e4efe6",
  },
  {
    title: "Outfit Creator",
    detail: "Created 20 outfits",
    icon: "sparkles-outline" as const,
    background: "#ece6f5",
  },
  {
    title: "Style Explorer",
    detail: "Reached level 4",
    icon: "star-outline" as const,
    background: "#e4eef6",
  },
];

function comingSoon(feature: string) {
  Alert.alert("Coming soon", `${feature} isn’t available in the app yet.`);
}

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const displayName = profile?.display_name?.trim() || "Your profile";
  const firstName = displayName.split(/\s+/)[0] ?? displayName;
  const initials = getProfileInitials(profile?.display_name, user?.email ?? "");
  const vibes = profile?.style_vibes ?? [];
  const tagline = profileTagline(vibes);

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
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>Hi, {firstName} 👋</Text>
          <Text style={styles.sub}>Here&apos;s your style journey</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => comingSoon("Notifications")}
            accessibilityLabel="Notifications, coming soon"
          >
            <Ionicons name="notifications-outline" size={18} color={colors.ink} />
            <View style={styles.soonDot} />
          </Pressable>
          <Pressable
            style={styles.iconBtn}
            onPress={() => comingSoon("Settings")}
            accessibilityLabel="Settings, coming soon"
          >
            <Ionicons name="settings-outline" size={18} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileRow}>
          <Pressable
            style={styles.avatarWrap}
            onPress={() => comingSoon("Profile photo")}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={10} color={colors.ink} />
            </View>
          </Pressable>

          <View style={styles.profileCopy}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            {profile?.location_city ? (
              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={12}
                  color={colors.inkMuted}
                />
                <Text style={styles.location} numberOfLines={1}>
                  {profile.location_city}
                </Text>
              </View>
            ) : null}
            {tagline ? (
              <Text style={styles.bio} numberOfLines={2}>
                {tagline}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.levelRow}>
          <Ionicons name="trophy-outline" size={16} color={colors.brand} />
          <Text style={styles.levelLabel}>Style Explorer</Text>
          <ComingSoonBadge compact />
        </View>

        <Pressable
          style={styles.editBtn}
          onPress={() => comingSoon("Edit profile")}
        >
          <Text style={styles.editBtnText}>Edit profile</Text>
          <ComingSoonBadge compact />
        </Pressable>
      </View>

      <View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My style preferences</Text>
          <Pressable
            style={styles.sectionLink}
            onPress={() => comingSoon("Editing style preferences")}
          >
            <Text style={styles.sectionLinkText}>Edit</Text>
            <Ionicons name="chevron-forward" size={12} color={colors.inkFaint} />
          </Pressable>
        </View>

        <View style={styles.prefGrid}>
          <View style={styles.prefCard}>
            <View style={styles.prefIcon}>
              <Ionicons name="shirt-outline" size={14} color={colors.inkMuted} />
            </View>
            <Text style={styles.prefLabel}>Style vibe</Text>
            <Text style={styles.prefValue} numberOfLines={2}>
              {formatStyleVibesLabel(vibes)}
            </Text>
          </View>

          <Pressable
            style={styles.prefCard}
            onPress={() => comingSoon("Favourite colours")}
          >
            <View style={styles.prefTop}>
              <View style={styles.prefIcon}>
                <Ionicons
                  name="color-palette-outline"
                  size={14}
                  color={colors.inkMuted}
                />
              </View>
              <ComingSoonBadge compact />
            </View>
            <Text style={styles.prefLabel}>Favourite colours</Text>
            <View style={styles.swatches}>
              {["#1a1a1a", "#1f3a5f", "#cbb79a", "#c8c4be"].map((hex) => (
                <View
                  key={hex}
                  style={[styles.swatch, { backgroundColor: hex }]}
                />
              ))}
            </View>
          </Pressable>
        </View>
        <View style={[styles.prefGrid, styles.prefGridFollow]}>
          <Pressable
            style={styles.prefCard}
            onPress={() => comingSoon("Favourite brands")}
          >
            <View style={styles.prefTop}>
              <View style={styles.prefIcon}>
                <Ionicons name="heart-outline" size={14} color={colors.inkMuted} />
              </View>
              <ComingSoonBadge compact />
            </View>
            <Text style={styles.prefLabel}>Favourite brands</Text>
            <Text style={styles.prefValue}>Not set</Text>
          </Pressable>

          <Pressable
            style={styles.prefCard}
            onPress={() => comingSoon("Fit preference")}
          >
            <View style={styles.prefTop}>
              <View style={styles.prefIcon}>
                <Ionicons name="resize-outline" size={14} color={colors.inkMuted} />
              </View>
              <ComingSoonBadge compact />
            </View>
            <Text style={styles.prefLabel}>Fit preference</Text>
            <Text style={styles.prefValue}>Not set</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.menuCard}>
        {MENU.map((item, index) => (
          <View key={item.title}>
            {index > 0 ? <View style={styles.menuDivider} /> : null}
            <ProfileMenuRow
              icon={item.icon}
              title={item.title}
              description={item.description}
              comingSoon={!item.href}
              onPress={() => {
                if (item.href) {
                  router.push(item.href);
                  return;
                }
                comingSoon(item.title);
              }}
            />
          </View>
        ))}
      </View>

      <View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <ComingSoonBadge compact />
        </View>
        <View style={styles.achieveGrid}>
          {ACHIEVEMENTS.slice(0, 2).map((item) => (
            <Pressable
              key={item.title}
              style={[styles.achieveCard, { backgroundColor: item.background }]}
              onPress={() => comingSoon("Achievements")}
            >
              <Ionicons name={item.icon} size={18} color={colors.ink} />
              <Text style={styles.achieveTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.achieveDetail} numberOfLines={1}>
                {item.detail}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={[styles.achieveGrid, styles.prefGridFollow]}>
          {ACHIEVEMENTS.slice(2).map((item) => (
            <Pressable
              key={item.title}
              style={[styles.achieveCard, { backgroundColor: item.background }]}
              onPress={() => comingSoon("Achievements")}
            >
              <Ionicons name={item.icon} size={18} color={colors.ink} />
              <Text style={styles.achieveTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.achieveDetail} numberOfLines={1}>
                {item.detail}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        style={styles.supportCard}
        onPress={() => comingSoon("Help centre")}
      >
        <View style={styles.supportIcon}>
          <Ionicons name="headset-outline" size={16} color={colors.ink} />
        </View>
        <View style={styles.supportCopy}>
          <View style={styles.titleRow}>
            <Text style={styles.supportTitle}>Need help?</Text>
            <ComingSoonBadge compact />
          </View>
          <Text style={styles.supportBody} numberOfLines={1}>
            Visit our help centre or contact support
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color={colors.inkFaint} />
      </Pressable>

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
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
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
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  soonDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 10,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  avatarWrap: {
    position: "relative",
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
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
    paddingTop: 1,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 18,
    lineHeight: 22,
    color: colors.ink,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  location: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
    flexShrink: 1,
  },
  bio: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    color: colors.inkMuted,
    marginTop: 4,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.page,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  levelLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkMuted,
    flex: 1,
  },
  editBtn: {
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.cream,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  editBtnText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.ink,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 17,
    color: colors.ink,
    flexShrink: 1,
  },
  sectionLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  sectionLinkText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.inkMuted,
  },
  prefGrid: {
    flexDirection: "row",
    gap: 8,
  },
  prefGridFollow: {
    marginTop: 8,
  },
  prefCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    gap: 6,
  },
  prefTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  prefIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  prefLabel: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkFaint,
  },
  prefValue: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    lineHeight: 17,
    color: colors.ink,
  },
  swatches: {
    flexDirection: "row",
    gap: 5,
    marginTop: 2,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 54,
  },
  achieveGrid: {
    flexDirection: "row",
    gap: 8,
  },
  achieveCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  achieveTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: colors.ink,
  },
  achieveDetail: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 14,
    color: colors.inkMuted,
  },
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.cream,
    borderRadius: 16,
    padding: 12,
  },
  supportIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  supportCopy: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  supportTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.ink,
    flexShrink: 1,
  },
  supportBody: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 14,
    color: colors.inkMuted,
    marginTop: 1,
  },
});
