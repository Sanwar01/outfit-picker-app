import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { needsReview } from '@shared/types/clothing';
import {
  draftReviewColorSeasonLine,
  draftReviewMetaLine,
} from '@shared/wardrobe/draft-review';
import { Screen } from '@/components/ui/screen';
import { Button } from '@/components/ui/primitives';
import {
  confirmClothingDraft,
  discardClothingDraft,
  getClothingDraft,
} from '@/lib/wardrobe-drafts';
import { invalidateBillingUsage } from '@/lib/queries/invalidate';
import {
  editDraftRoute,
  navigateAfterDraftSaved,
  parseBulkParam,
  parseReviewQueueParam,
  parseReviewTotal,
  reviewProgressLabel,
} from '@/lib/review-queue';
import type { ClothingDraftResponse } from '@shared/wardrobe/drafts';
import { colors, fonts } from '@/lib/theme';

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
  const progressLabel = fromBulk ? '' : reviewProgressLabel(currentIndex, total);
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
    Alert.alert('Discard item?', 'This photo and its tags will be removed.', [
      { text: 'Keep editing', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
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
        'hardwareBackPress',
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
        <Text style={styles.errorBody}>{error ?? 'Draft not found.'}</Text>
        <Button
          title="Go back"
          variant="outline"
          onPress={() => router.back()}
        />
      </Screen>
    );
  }

  const showReviewHint =
    draft.name === 'Clothing item' ||
    draft.tagging_status === 'failed' ||
    needsReview(draft);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={fromBulk ? () => router.back() : handleDiscard}
          hitSlop={12}
        >
          <Ionicons name="close" size={24} color={colors.ink} />
        </Pressable>
      </View>

      {progressLabel ? (
        <Text style={styles.progress}>{progressLabel}</Text>
      ) : null}

      <Image
        source={{ uri: draft.signedImageUrl }}
        style={styles.hero}
        accessibilityLabel={draft.name}
        alt={draft.name}
      />

      <Text style={styles.title}>{draft.name}</Text>
      <Text style={styles.meta}>{draftReviewMetaLine(draft)}</Text>
      <Text style={styles.meta}>{draftReviewColorSeasonLine(draft)}</Text>

      {showReviewHint ? (
        <Text style={styles.hint}>
          {draft.name === 'Clothing item'
            ? "AI couldn't tag this one — check the details before saving."
            : draft.tagging_status === 'failed'
              ? "AI couldn't tag this one — check the details before saving."
              : "AI isn't fully confident — a quick check is worth it."}
        </Text>
      ) : null}

      <Text style={styles.prompt}>Looks right?</Text>

      <View style={styles.actions}>
        <Button
          title="Save item"
          loading={saving}
          onPress={() => void handleConfirm()}
        />
        <Button
          title="Edit details"
          variant="outline"
          disabled={saving}
          onPress={() =>
            router.push(
              editDraftRoute(id!, remainingQueue, total, fromBulk),
            )
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  progress: {
    marginBottom: 8,
    fontSize: 13,
    color: colors.inkMuted,
    fontFamily: fonts.sansMedium,
  },
  hero: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: colors.cream,
  },
  title: {
    marginTop: 20,
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.ink,
  },
  meta: {
    marginTop: 6,
    fontSize: 15,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
  hint: {
    marginTop: 16,
    fontSize: 13,
    color: colors.brand,
    fontFamily: fonts.sans,
  },
  prompt: {
    marginTop: 28,
    fontSize: 18,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
  },
  actions: {
    marginTop: 16,
    gap: 12,
  },
  loadingText: {
    marginTop: 12,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
  errorTitle: {
    fontSize: 20,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
  },
  errorBody: {
    textAlign: 'center',
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    marginBottom: 8,
  },
});
