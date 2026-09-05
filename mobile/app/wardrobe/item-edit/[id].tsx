import { useState } from "react";
import { ActivityIndicator, Alert, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/atoms";
import { DraftEditForm } from "@/features/wardrobe/components/draft-edit-form";
import { EditScreenHeader } from "@/features/wardrobe/components/edit-screen-header";
import { useAuth } from "@/hooks/use-auth";
import { queryKeys } from "@/services/query-client";
import {
  invalidateWardrobeQueries,
} from "@/services/query-invalidate";
import { useClothingItemQuery } from "@/features/wardrobe/hooks/use-wardrobe-queries";
import { updateClothingItem } from "@/features/wardrobe/api/items";
import type { ClothingDraftPatch } from "@shared/wardrobe/drafts";
import { colors } from "@/theme";
import { styles } from "@/features/wardrobe/styles/item-edit";

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
      <EditScreenHeader title="Edit item" />
      <DraftEditForm
        draft={item}
        saving={saving}
        saveButtonTitle="Save changes"
        onSave={handleSave}
      />
    </Screen>
  );
}
