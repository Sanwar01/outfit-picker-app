import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandMark, Button } from "@/components/atoms";
import { FooterLink } from "@/components/molecules";
import { WelcomeFeatureRow } from "@/features/welcome/components/welcome-feature-row";
import { welcomeSlides } from "@/theme/brand";
import { setHasSeenWelcome } from "@/features/welcome/api";
import { colors } from "@/theme";
import { styles } from "@/features/welcome/styles/screen";

import heroImage from "../../assets/images/welcome-hero.jpg";

const slide = welcomeSlides[0];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View style={styles.hero}>
        <Image
          alt="Welcome hero"
          source={heroImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="center"
        />
        <LinearGradient
          colors={["transparent", colors.cream]}
          locations={[0.55, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={[styles.brandWrap, { paddingTop: insets.top + 12 }]}>
          <BrandMark />
        </View>
      </View>

      <View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom, 16) + 12 },
        ]}
      >
        <Text style={styles.headline}>{slide.headline}</Text>
        {slide.headlineAccent ? (
          <Text style={styles.headlineAccent}>{slide.headlineAccent}</Text>
        ) : null}
        <Text style={styles.subheadline}>{slide.subheadline}</Text>

        <View style={styles.features}>
          {slide.features.map((f) => (
            <WelcomeFeatureRow
              key={f.id}
              icon={f.icon}
              title={f.title}
              body={f.body}
            />
          ))}
        </View>

        <Button
          title="Get started"
          onPress={async () => {
            await setHasSeenWelcome();
            router.push("/(auth)/signup");
          }}
          style={styles.cta}
        />

        <View style={styles.footer}>
          <FooterLink
            prompt="Already have an account?"
            actionLabel="Log in"
            href="/(auth)/login"
          />
        </View>
      </View>
    </View>
  );
}
