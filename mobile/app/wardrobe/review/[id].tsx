import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, Text } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Screen } from "@/components/atoms";
import { DraftReviewView } from "@/features/wardrobe/components/draft-review-view";
import {
  confirmClothingDraft,
  discardClothingDraft,
  getClothingDraft,
} from "@/features/wardrobe/api/drafts";
import { invalidateBillingUsage } from "@/services/query-invalidate";
import {
  editDraftRoute,
  navigateAfterDraftSaved,
  parseBulkParam,
  parseReviewQueueParam,
  parseReviewTotal,
  reviewProgressLabel,
} from "@/features/wardrobe/api/review-queue";
import type { ClothingDraftResponse } from "@shared/wardrobe/drafts";
import { colors } from "@/theme";
import { styles } from "@/features/wardrobe/styles/draft-review";

export default function DraftReviewScreen() {
  const {
    id,
    queue,
    total: totalParam,
    bulk: bulkParam,
  } = useLocalSearchParams<{
    id: string;
    queue?: string;
    total?: string;
    bulk?: string;
  }>();
  const queryClient = useQueryClient();
  const fromBulk = parseBulkParam(bulkParam);
  const remainingQueue = parseReviewQueueParam(queue);
  const total = parseReviewTotal(totalParam, remainingQueue.length);
  const currentIndex = total - remainingQueue.length;
  const progressLabel = fromBulk ? "" : reviewProgressLabel(currentIndex, total);
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

  const handleDiscard = useCallback(() => {
    if (!id) return;
    Alert.alert("Discard item?", "This photo and its tags will be removed.", [
      { text: "Keep editing", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          void (async () => {
            await discardClothingDraft(id);
            navigateAfterDraftSaved(remainingQueue, total, fromBulk);
          })();
        },
      },
    ]);
  }, [fromBulk, id, remainingQueue, total]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (fromBulk) {
            router.back();
            return true;
          }
          handleDiscard();
          return true;
        },
      );
      return () => subscription.remove();
    }, [fromBulk, handleDiscard]),
  );

  async function handleConfirm() {
    if (!id) return;
    setSaving(true);
    const result = await confirmClothingDraft(id);
    setSaving(false);
    if (!result.ok) {
      Alert.alert("Couldn't save item", result.error);
      return;
    }
    invalidateBillingUsage(queryClient);
    navigateAfterDraftSaved(remainingQueue, total, fromBulk);
  }

  if (loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.brand} size="large" />
        <Text style={styles.loadingText}>Analysing your item…</Text>
      </Screen>
    );
  }

  if (error || !draft) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.errorTitle}>Couldn&apos;t load item</Text>
        <Text style={styles.errorBody}>{error ?? "Draft not found."}</Text>
        <Button title="Go back" variant="outline" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <DraftReviewView
        draft={draft}
        progressLabel={progressLabel}
        saving={saving}
        onClose={fromBulk ? () => router.back() : handleDiscard}
        onConfirm={() => void handleConfirm()}
        onEdit={() =>
          router.push(editDraftRoute(id!, remainingQueue, total, fromBulk))
        }
      />
    </Screen>
  );
}
