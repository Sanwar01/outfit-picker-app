import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  profileCompletionMessage,
  type ProfileCompletionIssue,
} from "@/lib/profile-display";
import { colors, fonts } from "@/lib/theme";

type CompleteProfileBannerProps = {
  issues: ProfileCompletionIssue[];
};

export function CompleteProfileBanner({ issues }: CompleteProfileBannerProps) {
  if (issues.length === 0) return null;

  return (
    <Pressable
      style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
      onPress={() => router.push("/profile/edit")}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="sparkles-outline" size={18} color={colors.brand} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Complete your profile</Text>
        <Text style={styles.body}>{profileCompletionMessage(issues)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.brand} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.brandSubtle,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
  },
  body: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
});
