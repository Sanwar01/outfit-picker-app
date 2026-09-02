import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { brand } from "@/lib/brand";
import {
  AuthDivider,
  AuthError,
  AuthField,
  AuthFooterLink,
  AuthScreen,
  AuthSheetHeader,
  SocialAuthButtons,
} from "@/components/auth";
import { Button } from "@/components/ui/primitives";

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: fullName.trim() || email.split("@")[0] },
      },
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
      headline={brand.signupHeadline}
      subheadline={brand.signupSubheadline}
      showBack
      featureVariant="signup"
    >
      <AuthSheetHeader title="Sign up" subtitle="Start your wardrobe" />

      {error ? <AuthError message={error} /> : null}

      <View style={styles.stack}>
        <SocialAuthButtons onError={setError} />
        <AuthDivider label="or continue with email" />
      </View>

      <View style={styles.form}>
        <AuthField
          type="text"
          value={fullName}
          onChangeText={setFullName}
          autoComplete="name"
          placeholder="Full name"
        />
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
          autoComplete="new-password"
          placeholder="Password"
        />

        <Button title="Create account" loading={loading} onPress={handleSignup} />
      </View>

      <View style={styles.footer}>
        <AuthFooterLink
          prompt="Already have an account?"
          actionLabel="Log in"
          href="/(auth)/login"
        />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 16,
    marginBottom: 16,
  },
  form: {
    gap: 12,
  },
  footer: {
    marginTop: 24,
  },
});
