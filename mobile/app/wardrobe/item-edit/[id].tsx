import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/screen";
import { DraftEditForm } from "@/components/wardrobe/draft-edit-form";
import { getClothingItem, updateClothingItem } from "@/lib/wardrobe-items";
import type { ClothingDraftPatch } from "@shared/wardrobe/drafts";
import type { ClothingDraftResponse } from "@shared/wardrobe/drafts";
import { colors, fonts } from "@/lib/theme";

export default function ItemEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [fetchState, setFetchState] = useState<{
    id: string | null;
    item: ClothingDraftResponse | null;
    error: string | null;
  }>({ id: null, item: null, error: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    void getClothingItem(id).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setFetchState({ id, item: null, error: result.error });
        return;
      }
      setFetchState({ id, item: result.data, error: null });
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const loading = Boolean(id) && fetchState.id !== id;
  const item = fetchState.id === id ? fetchState.item : null;
  const error = fetchState.id === id ? fetchState.error : null;

  async function handleSave(patch: ClothingDraftPatch) {
    if (!id) return;
    setSaving(true);
    const result = await updateClothingItem(id, patch);
    setSaving(false);

    if (!result.ok) {
      Alert.alert("Couldn't save changes", result.error);
      return;
    }

    router.back();
  }

  if (loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.brand} size="large" />
      </Screen>
    );
  }

  if (error || !item) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.errorTitle}>Couldn&apos;t load item</Text>
        <Text style={styles.errorBody}>{error ?? "Item not found."}</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit item</Text>
        <View style={styles.headerSpacer} />
      </View>

      <DraftEditForm
        draft={item}
        saving={saving}
        saveButtonTitle="Save changes"
        onSave={handleSave}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
  },
  headerSpacer: {
    width: 24,
  },
  errorTitle: {
    fontSize: 20,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
  },
  errorBody: {
    textAlign: "center",
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
});
