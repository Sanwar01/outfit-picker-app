import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ClothingItem } from '@shared/types/database';

import { SLOT_ORDER, type GeneratedOutfit } from '@shared/types/outfit';
import { colors, fonts } from '@/lib/theme';
import { Button } from '@/components/ui/primitives';
import { CATEGORY_LABELS } from '@shared/types/clothing';

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
  const sortedItems = SLOT_ORDER.flatMap((slot) => {
    const itemId = outfit.slots[slot];
    if (!itemId) return [];
    const item = outfit.items.find((i) => i.id === itemId);
    return item ? [item] : [];
  });
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

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  eyebrow: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.ink,
  },
  sectionSub: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkMuted,
    marginTop: 2,
  },
  body: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  heroWrap: {
    width: '48%',
    position: 'relative',
  },
  hero: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: colors.cream,
  },
  heroPlaceholder: {
    aspectRatio: 3 / 4,
  },
  shuffleChip: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  shuffleText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.ink,
  },
  itemList: {
    flex: 1,
    gap: 14,
    paddingTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
  },
  thumbPlaceholder: {
    backgroundColor: colors.creamDeep,
  },
  itemCopy: {
    flex: 1,
  },
  itemName: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    lineHeight: 18,
    color: colors.ink,
  },
  itemBrand: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    color: colors.inkFaint,
    marginTop: 2,
  },
  why: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  whyTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
    marginBottom: 2,
  },
  whyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  whyIcon: {
    marginTop: 2,
  },
  whyText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 48,
  },
});
