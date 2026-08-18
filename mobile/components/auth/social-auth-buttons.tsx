import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppleIcon, GoogleIcon } from "@/components/auth/social-icons";
import { signInWithOAuth } from "@/lib/oauth";
import { colors, fonts, radius } from "@/lib/theme";

type SocialAuthButtonsProps = {
  onError?: (message: string) => void;
};

export function SocialAuthButtons({ onError }: SocialAuthButtonsProps) {
  const [loading, setLoading] = useState<"apple" | "google" | null>(null);

  async function handlePress(provider: "apple" | "google") {
    setLoading(provider);
    try {
      await signInWithOAuth(provider);
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
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={() => handlePress("apple")}
        disabled={loading !== null}
      >
        {loading === "apple" ? (
          <ActivityIndicator color={colors.ink} />
        ) : (
          <>
            <AppleIcon />
            <Text style={styles.label}>Continue with Apple</Text>
          </>
        )}
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={() => handlePress("google")}
        disabled={loading !== null}
      >
        {loading === "google" ? (
          <ActivityIndicator color={colors.ink} />
        ) : (
          <>
            <GoogleIcon />
            <Text style={styles.label}>Continue with Google</Text>
          </>
        )}
      </Pressable>
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
