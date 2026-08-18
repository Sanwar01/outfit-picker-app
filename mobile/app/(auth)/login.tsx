import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";
import { Button, ScreenSubtitle, ScreenTitle } from "@/components/ui/primitives";
import { Screen } from "@/components/ui/screen";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.replace("/");
  }

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <ScreenTitle>Welcome back</ScreenTitle>
            <ScreenSubtitle>Log in to continue</ScreenSubtitle>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="you@example.com"
              placeholderTextColor={colors.inkFaint}
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              placeholder="••••••••"
              placeholderTextColor={colors.inkFaint}
              style={styles.input}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button title="Log in" loading={loading} onPress={handleLogin} />

            <Link href="/(auth)/signup" asChild>
              <Text style={styles.link}>
                Don&apos;t have an account?{" "}
                <Text style={styles.linkBold}>Sign up</Text>
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 48 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", paddingBottom: 32 },
  hero: { marginBottom: 32 },
  form: { gap: 12 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
    fontFamily: "DMSans_600SemiBold",
  },
  input: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.ink,
    fontFamily: "DMSans_400Regular",
    marginBottom: 4,
  },
  error: {
    color: colors.destructive,
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
  },
  link: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
    color: colors.inkMuted,
    fontFamily: "DMSans_400Regular",
  },
  linkBold: {
    color: colors.brand,
    fontFamily: "DMSans_600SemiBold",
  },
});
