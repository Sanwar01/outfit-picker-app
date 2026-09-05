import { useState } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/atoms";
import { FooterLink } from "@/components/molecules";
import { SheetHeader } from "@/components/organisms";
import { AuthError } from "@/features/auth/components/auth-error";
import { AuthScreen } from "@/features/auth/components/auth-screen";
import { supabase } from "@/services/supabase";
import { getAuthRedirectUrl } from "@/services/oauth";
import { brand } from "@/theme/brand";
import { styles } from "@/features/auth/styles/check-email";

export default function CheckEmailScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const email = typeof emailParam === "string" ? emailParam : "";
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    if (!email.trim()) {
      setError("Missing email address. Go back and sign up again.");
      return;
    }

    setLoading(true);
    setError(null);
    setInfo(null);

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });

    setLoading(false);

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setInfo("Another confirmation email is on its way.");
  }

  return (
    <AuthScreen
      headline={brand.signupHeadline}
      subheadline="One quick step left"
      showBack
      showFeatures={false}
    >
      <SheetHeader
        title="Check your email"
        subtitle={
          email
            ? `We sent a confirmation link to ${email}`
            : "We sent you a confirmation link"
        }
      />

      {error ? <AuthError message={error} /> : null}
      {info ? <Text style={styles.info}>{info}</Text> : null}

      <Text style={styles.body}>
        Open the link on this phone to confirm your account and continue in the
        app. The link may take a minute to arrive — check spam if you
        don&apos;t see it.
      </Text>

      <View style={styles.actions}>
        <Button
          title="Resend email"
          variant="outline"
          loading={loading}
          onPress={() => void handleResend()}
        />
        <Button
          title="Back to log in"
          variant="ghost"
          onPress={() => router.replace("/(auth)/login")}
        />
      </View>

      <View style={styles.footer}>
        <FooterLink
          prompt="Wrong email?"
          actionLabel="Sign up again"
          href="/(auth)/signup"
        />
      </View>
    </AuthScreen>
  );
}
