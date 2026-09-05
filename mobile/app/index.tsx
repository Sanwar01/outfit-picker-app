import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { getHasSeenWelcome } from "@/features/welcome/api";
import { colors } from "@/theme";

export default function Index() {
  const { session, profile, loading } = useAuth();
  const [welcomeChecked, setWelcomeChecked] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  useEffect(() => {
    getHasSeenWelcome().then((seen) => {
      setHasSeenWelcome(seen);
      setWelcomeChecked(true);
    });
  }, []);

  if (loading || !welcomeChecked) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href={hasSeenWelcome ? "/(auth)/login" : "/welcome"} />;
  }

  if (profile && !profile.onboarding_complete) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/today" />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.page,
  },
});
