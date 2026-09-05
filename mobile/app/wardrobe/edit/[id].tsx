import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/atoms";
import { DraftEditForm } from "@/features/wardrobe/components/draft-edit-form";
import { EditScreenHeader } from "@/features/wardrobe/components/edit-screen-header";
import {
  confirmClothingDraft,
  getClothingDraft,
  updateClothingDraft,
} from "@/features/wardrobe/api/drafts";
import { invalidateBillingUsage } from "@/services/query-invalidate";
import {
  navigateAfterDraftSaved,
  parseBulkParam,
  parseReviewQueueParam,
  parseReviewTotal,
} from "@/features/wardrobe/api/review-queue";
import type { ClothingDraftPatch } from "@shared/wardrobe/drafts";
import type { ClothingDraftResponse } from "@shared/wardrobe/drafts";
import { colors } from "@/theme";
import { styles } from "@/features/wardrobe/styles/draft-edit";

export default function DraftEditScreen() {
  const { id, queue, total: totalParam, bulk: bulkParam } = useLocalSearchParams<{
    id: string;
    queue?: string;
    total?: string;
    bulk?: string;
  }>();
  const queryClient = useQueryClient();
  const fromBulk = parseBulkParam(bulkParam);
  const remainingQueue = parseReviewQueueParam(queue);
  const total = parseReviewTotal(totalParam, remainingQueue.length);
  const [fetchState, setFetchState] = useState<{
    id: string | null;
    draft: ClothingDraftResponse | null;
    error: string | null;
  }>({ id: null, draft: null, error: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    void getClothingDraft(id).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setFetchState({ id, draft: null, error: result.error });
        return;
      }
      setFetchState({ id, draft: result.data, error: null });
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const loading = Boolean(id) && fetchState.id !== id;
  const draft = fetchState.id === id ? fetchState.draft : null;
  const error = fetchState.id === id ? fetchState.error : null;

  async function handleSave(patch: ClothingDraftPatch) {
    if (!id) return;
    setSaving(true);
    const updateResult = await updateClothingDraft(id, patch);
    if (!updateResult.ok) {
      setSaving(false);
      Alert.alert("Couldn't save changes", updateResult.error);
      return;
    }

    const confirmResult = await confirmClothingDraft(id);
    setSaving(false);

    if (!confirmResult.ok) {
      Alert.alert("Couldn't save item", confirmResult.error);
      return;
    }

    invalidateBillingUsage(queryClient);
    navigateAfterDraftSaved(remainingQueue, total, fromBulk);
  }

  if (loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.brand} size="large" />
      </Screen>
    );
  }

  if (error || !draft) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.errorTitle}>Couldn&apos;t load item</Text>
        <Text style={styles.errorBody}>{error ?? "Draft not found."}</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <EditScreenHeader title="Edit details" />
      <DraftEditForm draft={draft} saving={saving} onSave={handleSave} />
    </Screen>
  );
}
