import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { brand } from "@/lib/brand";
import {
  getRememberedEmail,
  writeRememberedEmail,
} from "@/lib/remember-email";
import { colors, fonts } from "@/lib/theme";
import {
  AuthCheckbox,
  AuthError,
  AuthField,
  AuthFooterLink,
  AuthScreen,
  AuthSheetHeader,
} from "@/components/auth";
import { Button } from "@/components/ui/primitives";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRememberedEmail().then((saved) => {
      if (saved) setEmail(saved);
    });
  }, []);

  async function handleLogin() {
    setLoading(true);
    setError(null);

    const trimmed = email.trim();
    await writeRememberedEmail(rememberMe && trimmed ? trimmed : null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: trimmed,
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
    <AuthScreen
      headline={brand.loginHeadline}
      subheadline={brand.loginSubheadline}
    >
      <AuthSheetHeader title="Welcome back" subtitle="Log in to continue" />

      {error ? <AuthError message={error} /> : null}

      <View style={styles.form}>
        <AuthField
          type="email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="Email address"
        />
        <AuthField
          type="password"
          value={password}
          onChangeText={setPassword}
          autoComplete="password"
          placeholder="Password"
        />

        <View style={styles.options}>
          <AuthCheckbox
            checked={rememberMe}
            onChange={setRememberMe}
            label="Remember me"
          />
          <Link href="/(auth)/forgot-password" asChild>
            <Pressable hitSlop={6}>
              <Text style={styles.forgot}>Forgot password?</Text>
            </Pressable>
          </Link>
        </View>

        <Button title="Log in" loading={loading} onPress={handleLogin} />
      </View>

      <View style={styles.footer}>
        <AuthFooterLink
          prompt="Don't have an account?"
          actionLabel="Sign up"
          href="/(auth)/signup"
        />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
    marginTop: 4,
  },
  options: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 8,
  },
  forgot: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.brand,
  },
  footer: {
    marginTop: 24,
  },
});
