import { Pressable, Text, View } from "react-native";
import { CachedImage } from "@/components/atoms";
import { needsReview } from "@shared/types/clothing";
import type { ClothingItem } from "@shared/types/database";
import { wardrobeItemSubtitle } from "@shared/wardrobe/wardrobe-display";
import { styles } from "./wardrobe-grid-card.styles";

type WardrobeGridCardProps = {
  item: ClothingItem;
  imageUrl?: string;
  onPress: () => void;
};

export function WardrobeGridCard({
  item,
  imageUrl,
  onPress,
}: WardrobeGridCardProps) {
  const flagged =
    item.name === "Clothing item" ||
    item.tagging_status === "failed" ||
    needsReview(item);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {imageUrl ? (
        <CachedImage
          source={{ uri: imageUrl }}
          style={styles.image}
          accessibilityLabel={item.name}
          alt={item.name}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      {item.is_favorite ? (
        <View style={styles.favoriteBadge}>
          <Text style={styles.favoriteText}>★</Text>
        </View>
      ) : null}
      {flagged ? <View style={styles.flagDot} /> : null}
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {wardrobeItemSubtitle(item)}
        </Text>
      </View>
    </Pressable>
  );
}
