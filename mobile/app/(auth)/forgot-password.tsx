import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { supabase } from "@/lib/supabase";
import { colors, fonts } from "@/lib/theme";
import {
  AuthError,
  AuthField,
  AuthScreen,
  AuthSheetHeader,
} from "@/components/auth";
import { Button } from "@/components/ui/primitives";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setLoading(true);
    setError(null);

    const siteUrl = process.env.EXPO_PUBLIC_SITE_URL;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      siteUrl
        ? { redirectTo: `${siteUrl}/auth/callback?next=/reset-password` }
        : undefined,
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  return (
    <AuthScreen
      headline={"Forgot your\npassword?"}
      subheadline="We'll email you a reset link so you can get back to your wardrobe."
      showBack
      showFeatures={false}
    >
      <AuthSheetHeader
        title="Reset password"
        subtitle="Enter the email on your account"
      />

      {error ? <AuthError message={error} /> : null}

      {sent ? (
        <Text style={styles.sent}>
          Check your inbox for a reset link. It may take a minute to arrive.
        </Text>
      ) : (
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
          <Button title="Send reset link" loading={loading} onPress={handleReset} />
        </View>
      )}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  sent: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
  },
});
