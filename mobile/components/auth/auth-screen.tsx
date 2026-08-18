import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthHero } from "@/components/auth/auth-hero";
import { AuthSheet } from "@/components/auth/auth-sheet";
import { colors } from "@/lib/theme";

const heroImage = require("../../assets/images/auth-hero.jpg");

type AuthScreenProps = {
  headline: string;
  subheadline: string;
  children: ReactNode;
  showBack?: boolean;
  showFeatures?: boolean;
  featureVariant?: "login" | "signup";
};

export function AuthScreen({
  headline,
  subheadline,
  children,
  showBack,
  showFeatures,
  featureVariant,
}: AuthScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <Image
        source={heroImage}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="top"
        pointerEvents="none"
      />
      <LinearGradient
        colors={[
          "rgba(247,244,240,0.18)",
          "rgba(247,244,240,0.06)",
          "rgba(247,244,240,0.4)",
        ]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingTop: insets.top + 8 }}>
            <AuthHero
              headline={headline}
              subheadline={subheadline}
              showBack={showBack}
              showFeatures={showFeatures}
              featureVariant={featureVariant}
            />
          </View>

          <AuthSheet style={{ paddingBottom: Math.max(insets.bottom, 16) + 12 }}>
            {children}
          </AuthSheet>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
});
