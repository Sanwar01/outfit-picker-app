import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/atoms";
import { needsReview } from "@shared/types/clothing";
import {
  draftReviewColorSeasonLine,
  draftReviewMetaLine,
} from "@shared/wardrobe/draft-review";
import type { ClothingDraftResponse } from "@shared/wardrobe/drafts";
import { colors } from "@/theme";
import { styles } from "./draft-review-view.styles";

type DraftReviewViewProps = {
  draft: ClothingDraftResponse;
  progressLabel: string;
  saving: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onEdit: () => void;
};

export function DraftReviewView({
  draft,
  progressLabel,
  saving,
  onClose,
  onConfirm,
  onEdit,
}: DraftReviewViewProps) {
  const showReviewHint =
    draft.name === "Clothing item" ||
    draft.tagging_status === "failed" ||
    needsReview(draft);

  return (
    <>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12}>
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
          {draft.name === "Clothing item" || draft.tagging_status === "failed"
            ? "AI couldn't tag this one — check the details before saving."
            : "AI isn't fully confident — a quick check is worth it."}
        </Text>
      ) : null}

      <Text style={styles.prompt}>Looks right?</Text>

      <View style={styles.actions}>
        <Button title="Save item" loading={saving} onPress={onConfirm} />
        <Button
          title="Edit details"
          variant="outline"
          disabled={saving}
          onPress={onEdit}
        />
      </View>
    </>
  );
}
