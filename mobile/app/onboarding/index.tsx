import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { STYLE_VIBES, type StyleVibe } from "@shared/types/clothing";
import { Button } from "@/components/atoms";
import { CitySearchField, StyleChips } from "@/components/organisms";
import { useAuth } from "@/hooks/use-auth";
import { geocodeCity } from "@/services/location";
import { supabase } from "@/services/supabase";
import { styles } from "@/features/onboarding/styles/screen";

function knownVibes(values: string[]): StyleVibe[] {
  return values.filter((value): value is StyleVibe =>
    (STYLE_VIBES as readonly string[]).includes(value),
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile, refreshProfile } = useAuth();
  const [vibes, setVibes] = useState<StyleVibe[]>(
    knownVibes(profile?.style_vibes ?? []),
  );
  const [city, setCity] = useState(profile?.location_city ?? "");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    profile?.location_lat != null && profile?.location_lng != null
      ? { lat: profile.location_lat, lng: profile.location_lng }
      : null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (!user) return;
    setSaving(true);
    setError(null);

    let nextCity = city.trim() || null;
    let nextLat = coords?.lat ?? null;
    let nextLng = coords?.lng ?? null;

    if (!nextCity) {
      nextLat = null;
      nextLng = null;
    } else if (!coords) {
      const lookedUp = await geocodeCity(nextCity);
      if (lookedUp.ok) {
        nextCity = lookedUp.location.city;
        nextLat = lookedUp.location.lat;
        nextLng = lookedUp.location.lng;
      }
    }

    const { error: saveError } = await supabase
      .from("profiles")
      .update({
        style_vibes: vibes,
        location_city: nextCity,
        location_lat: nextLat,
        location_lng: nextLng,
        onboarding_complete: true,
      })
      .eq("id", user.id);

    setSaving(false);

    if (saveError) {
      setError("Couldn't save that. Try again.");
      return;
    }

    await refreshProfile();
    router.replace("/(tabs)/today");
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>A few details</Text>
        <Text style={styles.sub}>
          Style and city help me pick outfits for the weather.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Style vibe</Text>
          <StyleChips selected={vibes} onChange={setVibes} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Location</Text>
          <CitySearchField
            value={city}
            onChangeText={(value) => {
              setCity(value);
              setCoords(null);
            }}
            onSelect={(location) => {
              setCity(location.city ?? city.trim());
              setCoords({ lat: location.lat, lng: location.lng });
              setError(null);
            }}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title="Continue"
          onPress={() => void handleContinue()}
          loading={saving}
          disabled={saving}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
