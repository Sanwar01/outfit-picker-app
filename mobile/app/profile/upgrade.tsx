import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { Screen, Button, ScreenSubtitle, ScreenTitle } from "@/components/atoms";
import {
  getJoinedProWaitlist,
  setJoinedProWaitlist,
} from "@/features/profile/api/pro-waitlist";
import { colors } from "@/theme";
import { styles } from "@/features/profile/styles/upgrade";

const PRO_BENEFITS = [
  {
    title: "Unlimited wardrobe",
    body: "No 75-item ceiling — keep every piece you wear.",
  },
  {
    title: "Unlimited AI styling",
    body: "Daily picks and shuffles without burning Free credits.",
  },
  {
    title: "More AI tagging",
    body: "Add and retag clothes without hitting the monthly Free cap.",
  },
  {
    title: "Coming next",
    body: "Wardrobe insights, shopping intelligence, and try-on allowance.",
  },
] as const;

export default function UpgradeScreen() {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void getJoinedProWaitlist().then((value) => {
        if (active) setJoined(value);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  async function handleJoinWaitlist() {
    if (joined) return;
    setLoading(true);
    try {
      await setJoinedProWaitlist();
      setJoined(true);
      Alert.alert(
        "You're on the list",
        "We'll let you know as soon as Pro checkout is ready. Free limits stay in place until then.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
          <Text style={styles.backText}>Profile</Text>
        </Pressable>

        <ScreenTitle>Upgrade to Pro</ScreenTitle>
        <ScreenSubtitle>
          More room in your closet, more AI help when you need a look — about
          £5.99/month when billing launches.
        </ScreenSubtitle>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Pro</Text>
          <Text style={styles.price}>£5.99</Text>
          <Text style={styles.pricePeriod}>per month · coming soon</Text>
        </View>

        <View style={styles.benefits}>
          {PRO_BENEFITS.map((benefit) => (
            <View key={benefit.title} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={colors.brand}
                />
              </View>
              <View style={styles.benefitCopy}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitBody}>{benefit.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <Button
          title={joined ? "You're on the waitlist" : "Notify me when Pro is ready"}
          onPress={() => void handleJoinWaitlist()}
          loading={loading}
          disabled={joined}
        />
        <Text style={styles.footnote}>
          Checkout isn’t live yet. Join the list and keep using Free — we’ll
          email you when you can upgrade.
        </Text>
      </ScrollView>
    </Screen>
  );
}
