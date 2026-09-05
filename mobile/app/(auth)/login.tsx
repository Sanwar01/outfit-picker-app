import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { Button } from "@/components/atoms";
import { Checkbox, Divider, FooterLink, TextField } from "@/components/molecules";
import { SheetHeader } from "@/components/organisms";
import { AuthError } from "@/features/auth/components/auth-error";
import { AuthScreen } from "@/features/auth/components/auth-screen";
import { SocialAuthButtons } from "@/features/auth/components/social-auth-buttons";
import { supabase } from "@/services/supabase";
import { brand } from "@/theme/brand";
import {
  getRememberedEmail,
  writeRememberedEmail,
} from "@/features/auth/api/remember-email";
import { styles } from "@/features/auth/styles/login";

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
      <SheetHeader title="Welcome back" subtitle="Log in to continue" />

      {error ? <AuthError message={error} /> : null}

      <View style={styles.stack}>
        <SocialAuthButtons onError={setError} />
        <Divider label="or continue with email" />
      </View>

      <View style={styles.form}>
        <TextField
          type="email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="Email address"
        />
        <TextField
          type="password"
          value={password}
          onChangeText={setPassword}
          autoComplete="password"
          placeholder="Password"
        />

        <View style={styles.options}>
          <Checkbox
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
        <FooterLink
          prompt="Don't have an account?"
          actionLabel="Sign up"
          href="/(auth)/signup"
        />
      </View>
    </AuthScreen>
  );
}
