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
import { useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/ui/screen";
import { DraftEditForm } from "@/components/wardrobe/draft-edit-form";
import {
  confirmClothingDraft,
  getClothingDraft,
  updateClothingDraft,
} from "@/lib/wardrobe-drafts";
import { invalidateBillingUsage } from "@/lib/queries/invalidate";
import {
  navigateAfterDraftSaved,
  parseBulkParam,
  parseReviewQueueParam,
  parseReviewTotal,
} from "@/lib/review-queue";
import type { ClothingDraftPatch } from "@shared/wardrobe/drafts";
import type { ClothingDraftResponse } from "@shared/wardrobe/drafts";
import { colors, fonts } from "@/lib/theme";

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
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <DraftEditForm draft={draft} saving={saving} onSave={handleSave} />
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
