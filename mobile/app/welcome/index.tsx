import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark, Button } from '@/components/atoms';
import { FooterLink } from '@/components/molecules';
import { welcomeSlides } from '@/lib/brand';
import { setHasSeenWelcome } from '@/lib/has-seen-welcome';
import { colors, fonts, radius } from '@/lib/theme';

import heroImage from '../../assets/images/welcome-hero.jpg';

const slide = welcomeSlides[0];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Hero photo fills top half */}
      <View style={styles.hero}>
        <Image
          alt="Welcome hero"
          source={heroImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="center"
        />
        {/* Fade out at the bottom into the sheet */}
        <LinearGradient
          colors={['transparent', colors.cream]}
          locations={[0.55, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Brand mark in top-left, inset by safe area */}
        <View style={[styles.brandWrap, { paddingTop: insets.top + 12 }]}>
          <BrandMark />
        </View>
      </View>

      {/* White rounded sheet */}
      <View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom, 16) + 12 },
        ]}
      >
        {/* Headline sits at the top of the sheet, slightly overlapping the photo */}
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
            router.push('/(auth)/signup');
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  hero: {
    flex: 1,
    minHeight: '50%',
  },
  brandWrap: {
    paddingHorizontal: 24,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: 24,
    paddingTop: 28,
    marginTop: -32,
    boxShadow: '0px -8px 30px rgba(0,0,0,0.06)',
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.5,
    color: colors.ink,
  },
  headlineAccent: {
    fontFamily: fonts.serif,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.5,
    color: colors.brand,
  },
  subheadline: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
    marginTop: 8,
    marginBottom: 24,
  },
  features: {
    gap: 20,
    marginBottom: 22,
  },
  cta: {
    marginBottom: 16,
  },
  footer: {
    marginBottom: 10,
    alignItems: 'center',
  },
});
