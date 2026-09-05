import { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "@/components/atoms";
import { TextField } from "@/components/molecules";
import { SheetHeader } from "@/components/organisms";
import { AuthError } from "../../sections/auth-error";
import { AuthScreen } from "../../sections/auth-screen";
import { supabase } from "@/lib/supabase";
import { getAuthRedirectUrl } from "@/lib/oauth";
import { styles } from "./forgot-password-screen.styles";

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: getAuthRedirectUrl() },
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
      <SheetHeader
        title="Reset password"
        subtitle="Enter the email on your account"
      />

      {error ? <AuthError message={error} /> : null}

      {sent ? (
        <Text style={styles.sent}>
          Check your inbox for a reset link. Open it on this phone so the app
          can continue — it may take a minute to arrive.
        </Text>
      ) : (
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
          <Button
            title="Send reset link"
            loading={loading}
            onPress={handleReset}
          />
        </View>
      )}
    </AuthScreen>
  );
}
