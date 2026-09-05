import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, CachedImage } from "@/components/atoms";
import {
  draftReviewColorSeasonLine,
  draftReviewMetaLine,
} from "@shared/wardrobe/draft-review";
import { formatLastWorn } from "@shared/wardrobe/wardrobe-display";
import type { ClothingDraftResponse } from "@shared/wardrobe/drafts";
import { colors } from "@/theme";
import { styles } from "./item-detail-view.styles";

type ItemDetailViewProps = {
  item: ClothingDraftResponse;
  outfitCount: number;
  onBack: () => void;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onArchiveToggle: () => void;
};

export function ItemDetailView({
  item,
  outfitCount,
  onBack,
  onToggleFavorite,
  onEdit,
  onArchiveToggle,
}: ItemDetailViewProps) {
  const lastWorn = formatLastWorn(item.last_worn_at);

  return (
    <>
      <View style={styles.topBar}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <View style={styles.topActions}>
          <Pressable onPress={onToggleFavorite} hitSlop={12}>
            <Ionicons
              name={item.is_favorite ? "heart" : "heart-outline"}
              size={22}
              color={item.is_favorite ? colors.brand : colors.ink}
            />
          </Pressable>
          <Pressable onPress={onEdit} hitSlop={12}>
            <Ionicons name="create-outline" size={22} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <CachedImage
          source={{ uri: item.signedImageUrl }}
          style={styles.hero}
          accessibilityLabel={item.name}
          alt={item.name}
          contentFit="cover"
        />

        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.meta}>{draftReviewMetaLine(item)}</Text>
        <Text style={styles.meta}>{draftReviewColorSeasonLine(item)}</Text>

        {item.brand ? (
          <Text style={styles.detail}>Brand · {item.brand}</Text>
        ) : null}
        {item.material ? (
          <Text style={styles.detail}>Material · {item.material}</Text>
        ) : null}
        {item.size ? <Text style={styles.detail}>Size · {item.size}</Text> : null}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.wear_count}</Text>
            <Text style={styles.statLabel}>Times worn</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{outfitCount}</Text>
            <Text style={styles.statLabel}>Saved outfits</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{lastWorn ?? "—"}</Text>
            <Text style={styles.statLabel}>Last worn</Text>
          </View>
        </View>

        {item.exclude_from_recommendations ? (
          <Text style={styles.note}>Excluded from outfit recommendations</Text>
        ) : null}

        {item.status === "archived" ? (
          <Button
            title="Restore to wardrobe"
            onPress={onArchiveToggle}
            style={styles.action}
          />
        ) : (
          <Button
            title="Archive item"
            variant="outline"
            onPress={onArchiveToggle}
            style={styles.action}
          />
        )}
      </ScrollView>
    </>
  );
}
