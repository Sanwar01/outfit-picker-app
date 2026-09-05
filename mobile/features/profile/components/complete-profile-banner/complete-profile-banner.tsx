import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  profileCompletionMessage,
  type ProfileCompletionIssue,
} from "@/services/profile-display";
import { colors } from "@/theme";
import { styles } from "./complete-profile-banner.styles";

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
