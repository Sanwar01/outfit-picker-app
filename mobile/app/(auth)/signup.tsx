import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/atoms";
import { Divider, FooterLink, TextField } from "@/components/molecules";
import { SheetHeader } from "@/components/organisms";
import { AuthError } from "@/features/auth/components/auth-error";
import { AuthScreen } from "@/features/auth/components/auth-screen";
import { SocialAuthButtons } from "@/features/auth/components/social-auth-buttons";
import { supabase } from "@/services/supabase";
import { getAuthRedirectUrl } from "@/services/oauth";
import { brand } from "@/theme/brand";
import { styles } from "@/features/auth/styles/signup";

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setLoading(true);
    setError(null);

    const trimmedEmail = email.trim();
    const { data, error: authError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: { display_name: fullName.trim() || trimmedEmail.split("@")[0] },
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.session) {
      router.replace("/");
      return;
    }

    router.replace({
      pathname: "/(auth)/check-email",
      params: { email: trimmedEmail },
    });
  }

  return (
    <AuthScreen
      headline={brand.signupHeadline}
      subheadline={brand.signupSubheadline}
      showBack
      featureVariant="signup"
    >
      <SheetHeader title="Sign up" subtitle="Start your wardrobe" />

      {error ? <AuthError message={error} /> : null}

      <View style={styles.stack}>
        <SocialAuthButtons onError={setError} />
        <Divider label="or continue with email" />
      </View>

      <View style={styles.form}>
        <TextField
          type="text"
          value={fullName}
          onChangeText={setFullName}
          autoComplete="name"
          placeholder="Full name"
        />
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
          autoComplete="new-password"
          placeholder="Password"
        />

        <Button
          title="Create account"
          loading={loading}
          onPress={() => void handleSignup()}
        />
      </View>

      <View style={styles.footer}>
        <FooterLink
          prompt="Already have an account?"
          actionLabel="Log in"
          href="/(auth)/login"
        />
      </View>
    </AuthScreen>
  );
}
