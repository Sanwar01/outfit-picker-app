import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { getAuthRedirectUrl } from "@/lib/oauth";
import { brand } from "@/lib/brand";
import { colors, fonts } from "@/lib/theme";
import {
  AuthError,
  AuthFooterLink,
  AuthScreen,
  AuthSheetHeader,
} from "@/components/auth";
import { Button } from "@/components/ui/primitives";

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
      <AuthSheetHeader
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
        <AuthFooterLink
          prompt="Wrong email?"
          actionLabel="Sign up again"
          href="/(auth)/signup"
        />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
    marginBottom: 8,
  },
  info: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.brand,
    marginBottom: 8,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
  },
});
