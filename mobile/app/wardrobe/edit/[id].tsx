import { useCallback, useEffect, useState } from "react";
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
import {
  confirmClothingDraft,
  getClothingDraft,
  updateClothingDraft,
} from "@/lib/wardrobe-drafts";
import {
  navigateAfterDraftSaved,
  parseReviewQueueParam,
  parseReviewTotal,
} from "@/lib/review-queue";
import type { ClothingDraftPatch } from "@shared/wardrobe/drafts";
import type { ClothingDraftResponse } from "@shared/wardrobe/drafts";
import { colors, fonts } from "@/lib/theme";

export default function DraftEditScreen() {
  const { id, queue, total: totalParam } = useLocalSearchParams<{
    id: string;
    queue?: string;
    total?: string;
  }>();
  const remainingQueue = parseReviewQueueParam(queue);
  const total = parseReviewTotal(totalParam, remainingQueue.length);
  const [draft, setDraft] = useState<ClothingDraftResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const result = await getClothingDraft(id);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDraft(result.data);
    setError(null);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

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

    navigateAfterDraftSaved(remainingQueue, total);
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
        <Text style={styles.errorTitle}>Couldn't load item</Text>
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
