import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { STYLE_VIBES, type StyleVibe } from "@shared/types/clothing";
import { Button } from "@/components/atoms";
import { CitySearchField, StyleChips } from "@/components/organisms";
import { useAuth } from "@/hooks/use-auth";
import { geocodeCity } from "@/services/location";
import { supabase } from "@/services/supabase";
import { colors } from "@/theme";
import { styles } from "@/features/profile/styles/edit";

function knownVibes(values: string[]): StyleVibe[] {
  return values.filter((value): value is StyleVibe =>
    (STYLE_VIBES as readonly string[]).includes(value),
  );
}

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.display_name ?? "");
  const [city, setCity] = useState(profile?.location_city ?? "");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    profile?.location_lat != null && profile?.location_lng != null
      ? { lat: profile.location_lat, lng: profile.location_lng }
      : null,
  );
  const [vibes, setVibes] = useState<StyleVibe[]>(
    knownVibes(profile?.style_vibes ?? []),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(() => {
    const originalVibes = knownVibes(profile?.style_vibes ?? []).join("|");
    const originalLat = profile?.location_lat ?? null;
    const originalLng = profile?.location_lng ?? null;
    return (
      name.trim() !== (profile?.display_name ?? "").trim() ||
      city.trim() !== (profile?.location_city ?? "").trim() ||
      vibes.join("|") !== originalVibes ||
      coords?.lat !== originalLat ||
      coords?.lng !== originalLng
    );
  }, [city, coords, name, profile, vibes]);

  async function handleSave() {
    if (!user) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Enter your name so we know how to greet you.");
      return;
    }

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
        display_name: trimmedName,
        style_vibes: vibes,
        location_city: nextCity,
        location_lat: nextLat,
        location_lng: nextLng,
      })
      .eq("id", user.id);

    setSaving(false);

    if (saveError) {
      setError("Couldn't save your profile. Try again.");
      return;
    }

    await refreshProfile();
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Back to profile"
        >
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>Edit profile</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.sectionTitle}>Personal information</Text>
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Full name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.inkFaint}
              maxLength={60}
              autoCapitalize="words"
              autoCorrect={false}
              style={styles.input}
            />

            <Text style={[styles.fieldLabel, styles.fieldLabelFollow]}>
              Location
            </Text>
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
        </View>

        <View>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Style vibe</Text>
            <StyleChips selected={vibes} onChange={setVibes} />
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <Button
          title="Save changes"
          onPress={() => void handleSave()}
          loading={saving}
          disabled={saving || !dirty}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
