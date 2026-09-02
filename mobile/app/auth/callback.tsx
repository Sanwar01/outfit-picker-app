import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import * as Linking from "expo-linking";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";

/**
 * Deep-link landing page for OAuth returns when the app is cold-started
 * via outfitpicker://auth/callback (or Expo Go equivalent).
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

      const { params, errorCode } = QueryParams.getQueryParams(url);
      if (errorCode) {
        if (!cancelled) {
          setFailed(true);
          setDone(true);
        }
        return;
      }

      try {
        const code = params.code;
        if (typeof code === "string" && code.length > 0) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (
          typeof params.access_token === "string" &&
          typeof params.refresh_token === "string"
        ) {
          const { error } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
          if (error) throw error;
        }
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setDone(true);
      }
    }

    void Linking.getInitialURL().then((url) => completeFromUrl(url));

    const subscription = Linking.addEventListener("url", ({ url }) => {
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.page,
  },
});
