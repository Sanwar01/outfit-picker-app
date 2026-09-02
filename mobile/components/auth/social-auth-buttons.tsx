import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { AppleIcon, GoogleIcon } from "@/components/auth/social-icons";
import {
  signInWithOAuth,
  type OAuthProvider,
} from "@/lib/oauth";
import { colors, fonts, radius } from "@/lib/theme";

type SocialAuthButtonsProps = {
  /** Defaults to Google only until Apple Sign In is configured. */
  providers?: OAuthProvider[];
  onError?: (message: string) => void;
  onSuccess?: () => void;
};

const LABELS: Record<OAuthProvider, string> = {
  google: "Continue with Google",
  apple: "Continue with Apple",
};

export function SocialAuthButtons({
  providers = ["google"],
  onError,
  onSuccess,
}: SocialAuthButtonsProps) {
  const [loading, setLoading] = useState<OAuthProvider | null>(null);

  async function handlePress(provider: OAuthProvider) {
    setLoading(provider);
    try {
      const result = await signInWithOAuth(provider);
      if (result === "signed_in") {
        onSuccess?.();
        router.replace("/");
      }
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : "Social login failed.",
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <View style={styles.stack}>
      {providers.map((provider) => (
        <Pressable
          key={provider}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={() => void handlePress(provider)}
          disabled={loading !== null}
          accessibilityRole="button"
          accessibilityLabel={LABELS[provider]}
        >
          {loading === provider ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <>
              {provider === "google" ? <GoogleIcon /> : <AppleIcon />}
              <Text style={styles.label}>{LABELS[provider]}</Text>
            </>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  button: {
    height: 52,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  pressed: {
    backgroundColor: colors.surfaceHover,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    color: colors.ink,
  },
});
