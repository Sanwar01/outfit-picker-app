import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import type { ClothingItem } from '@shared/types/database';

import { CORE_SLOT_ORDER, type GeneratedOutfit } from '@shared/types/outfit';
import { normalizeOutfitSlots } from '@shared/outfits/slots';
import { colors } from '@/theme';
import { Button } from '@/components/atoms';
import { CATEGORY_LABELS } from '@shared/types/clothing';
import { styles } from "./outfit-card.styles";

function pickHeroItem(items: ClothingItem[]): ClothingItem {
  const byCategory = new Map(items.map((item) => [item.category, item]));
  return (
    byCategory.get('outerwear') ??
    byCategory.get('top') ??
    byCategory.get('bottom') ??
    items[0]
  );
}

function parseWhyPoints(rationale: string): string[] {
  return rationale
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
}

type OutfitCardProps = {
  outfit: GeneratedOutfit;
  wornToday: boolean;
  wearing: boolean;
  saved: boolean;
  saving: boolean;
  onWear: () => void;
  onSave: () => void;
  onShuffle: () => void;
};

export function OutfitCard({
  outfit,
  wornToday,
  wearing,
  saved,
  saving,
  onWear,
  onSave,
  onShuffle,
}: OutfitCardProps) {
  const slots = normalizeOutfitSlots(outfit.slots);
  const sortedItems = [
    ...CORE_SLOT_ORDER.flatMap((slot) => {
      const itemId = slots[slot];
      if (!itemId) return [];
      const item = outfit.items.find((i) => i.id === itemId);
      return item ? [item] : [];
    }),
    ...(slots.accessories ?? []).flatMap((itemId) => {
      const item = outfit.items.find((i) => i.id === itemId);
      return item ? [item] : [];
    }),
  ];
  const items = sortedItems.length > 0 ? sortedItems : outfit.items;
  const heroItem = pickHeroItem(items);
  const heroUrl = heroItem ? outfit.imageUrls[heroItem.image_url] : undefined;
  const whyPoints = outfit.rationale ? parseWhyPoints(outfit.rationale) : [];

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Today&apos;s outfit ✨</Text>
          <Text style={styles.sectionSub}>
            Recommended for the weather and your style
          </Text>
        </View>

        <View style={styles.body}>
          <View style={styles.heroWrap}>
            {heroUrl ? (
              <Image
                alt={heroItem?.name ?? 'Outfit'}
                source={{ uri: heroUrl }}
                style={styles.hero}
                resizeMode="cover"
                accessibilityLabel={heroItem?.name ?? 'Outfit'}
              />
            ) : (
              <View style={[styles.hero, styles.heroPlaceholder]} />
            )}
            <Pressable style={styles.shuffleChip} onPress={onShuffle}>
              <Ionicons name="shuffle-outline" size={14} color={colors.ink} />
              <Text style={styles.shuffleText}>Another option</Text>
            </Pressable>
          </View>

          <View style={styles.itemList}>
            {items.map((item) => {
              const url = outfit.imageUrls[item.image_url];
              const subtitle = item.brand ?? CATEGORY_LABELS[item.category];
              return (
                <View key={item.id} style={styles.itemRow}>
                  {url ? (
                    <Image
                      alt={item.name}
                      source={{ uri: url }}
                      style={styles.itemThumb}
                      resizeMode="cover"
                      accessibilityLabel={item.name}
                    />
                  ) : (
                    <View style={[styles.itemThumb, styles.thumbPlaceholder]} />
                  )}
                  <View style={styles.itemCopy}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemBrand} numberOfLines={1}>
                      {subtitle}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {whyPoints.length > 0 && (
          <View style={styles.why}>
            <Text style={styles.whyTitle}>Why this works</Text>
            {whyPoints.map((point) => (
              <View key={point} style={styles.whyRow}>
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={colors.ink}
                  style={styles.whyIcon}
                />
                <Text style={styles.whyText}>{point}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Button
          title={wornToday ? 'Logged' : 'Wear this'}
          onPress={onWear}
          loading={wearing}
          disabled={wornToday}
          style={styles.actionBtn}
        />
        <Button
          title={saved ? 'Saved' : 'Save outfit'}
          variant="outline"
          onPress={onSave}
          loading={saving}
          disabled={saved}
          style={styles.actionBtn}
        />
      </View>
    </View>
  );
}
