import { StyleSheet, View } from "react-native";
import { Screen } from "@/components/ui/screen";
import { ScreenSubtitle, ScreenTitle } from "@/components/ui/primitives";
import { OutfitSuggestion } from "@/components/today/outfit-suggestion";
import { useAuth } from "@/lib/auth-context";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function TodayScreen() {
  const { profile } = useAuth();
  const name = profile?.display_name?.split(" ")[0] ?? "there";

  return (
    <Screen>
      <View style={styles.header}>
        <ScreenTitle>{`${getGreeting()}, ${name} 👋`}</ScreenTitle>
        <ScreenSubtitle>
          Here&apos;s what I recommend for you today
        </ScreenSubtitle>
      </View>
      <OutfitSuggestion />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
});
