import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useAuth } from '@/lib/auth-context';
import { createSessionFromUrl } from '@/lib/oauth';
import { colors } from '@/lib/theme';

/**
 * Deep-link landing for OAuth, email confirmation, and password reset
 * (`outfitpicker://auth/callback` or Expo Go equivalent).
 */
export default function AuthCallbackScreen() {
  const { session, loading } = useAuth();
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function completeFromUrl(url: string | null) {
      if (!url) {
        if (!cancelled) setDone(true);
        return;
      }

      // Ignore URLs that aren't auth callbacks (no code / token).
      if (
        !url.includes('code=') &&
        !url.includes('token_hash=') &&
        !url.includes('access_token=')
      ) {
        if (!cancelled) setDone(true);
        return;
      }

      try {
        await createSessionFromUrl(url);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setDone(true);
      }
    }

    void Linking.getInitialURL().then((url) => completeFromUrl(url));

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void completeFromUrl(url);
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  if (session) {
    return <Redirect href="/" />;
  }

  if (failed) {
    return <Redirect href="/(auth)/login" />;
  }

  if (loading || !done) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  return <Redirect href="/" />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.page,
  },
});
