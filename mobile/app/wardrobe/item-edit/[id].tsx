import { useState } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/ui/screen";
import { DraftEditForm } from "@/components/wardrobe/draft-edit-form";
import { useAuth } from "@/lib/auth-context";
import { queryKeys } from "@/lib/query-client";
import {
  invalidateClothingItemQuery,
  invalidateWardrobeQueries,
} from "@/lib/queries/invalidate";
import { useClothingItemQuery } from "@/lib/queries/wardrobe";
import { updateClothingItem } from "@/lib/wardrobe-items";
import type { ClothingDraftPatch } from "@shared/wardrobe/drafts";
import { colors, fonts } from "@/lib/theme";

export default function ItemEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: item, error, isLoading } = useClothingItemQuery(id);
  const [saving, setSaving] = useState(false);

  const loadError = error instanceof Error ? error.message : null;

  async function handleSave(patch: ClothingDraftPatch) {
    if (!id) return;
    setSaving(true);
    const result = await updateClothingItem(id, patch);
    setSaving(false);

    if (!result.ok) {
      Alert.alert("Couldn't save changes", result.error);
      return;
    }

    queryClient.setQueryData(queryKeys.wardrobe.item(id), result.data);
    invalidateWardrobeQueries(queryClient, user?.id);
    router.back();
  }

  if (isLoading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.brand} size="large" />
      </Screen>
    );
  }

  if (loadError || !item) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.errorTitle}>Couldn&apos;t load item</Text>
        <Text style={styles.errorBody}>{loadError ?? "Item not found."}</Text>
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
