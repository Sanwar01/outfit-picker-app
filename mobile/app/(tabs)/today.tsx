import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OutfitSuggestion } from "@/features/today/components/outfit-suggestion";
import { useAuth } from "@/hooks/use-auth";
import { getProfileFirstName, getTimeGreeting } from "@/services/profile-display";
import { spacing } from "@/theme";
import { styles } from "@/features/today/styles/screen";

export default function TodayScreen() {
  const { profile, user } = useAuth();
  const insets = useSafeAreaInsets();
  const firstName = getProfileFirstName(
    profile?.display_name,
    user?.email ?? "",
  );

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + spacing.tabBarHeight + 24,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {getTimeGreeting()}, {firstName} 👋
        </Text>
        <Text style={styles.sub}>
          Here&apos;s what I recommend for you today
        </Text>
      </View>

      <OutfitSuggestion />
    </ScrollView>
  );
}
