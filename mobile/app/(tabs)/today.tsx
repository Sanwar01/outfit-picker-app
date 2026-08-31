import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OutfitSuggestion } from '@/components/today/outfit-suggestion';
import { useAuth } from '@/lib/auth-context';
import { colors, fonts, spacing } from '@/lib/theme';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function TodayScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const firstName = profile?.display_name;

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
          {getGreeting()}, {firstName} 👋
        </Text>
        <Text style={styles.sub}>
          Here&apos;s what I recommend for you today
        </Text>
      </View>

      <OutfitSuggestion />
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
    gap: 20,
  },
  header: {
    marginBottom: 0,
  },
  greeting: {
    fontFamily: fonts.serif,
    fontSize: 24,
    lineHeight: 30,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    marginTop: 4,
  },
});
