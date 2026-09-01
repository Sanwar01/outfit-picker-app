import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import type { ClothingDraftPatch } from "@shared/wardrobe/drafts";
import type { ClothingDraftResponse } from "@shared/wardrobe/drafts";
import type { ClothingCategory } from "@shared/types/database";
import { FIT_OPTIONS } from "@shared/wardrobe/clothing-fit";
import {
  FORMALITY_OPTIONS,
  SEASON_OPTIONS,
  SUB_CATEGORY_OPTIONS,
} from "@shared/wardrobe/item-edit";
import { PICKABLE_OCCASIONS } from "@shared/today/occasions";
import { CATEGORY_LABELS } from "@shared/types/clothing";
import { colors, fonts } from "@/lib/theme";
import { Button } from "@/components/ui/primitives";
import { FormField } from "@/components/wardrobe/form-field";

const CATEGORIES: ClothingCategory[] = [
  "top",
  "bottom",
  "outerwear",
  "shoes",
  "accessory",
];

type DraftEditFormProps = {
  draft: ClothingDraftResponse;
  saving?: boolean;
  onSave: (patch: ClothingDraftPatch) => Promise<void>;
};

export function DraftEditForm({ draft, saving, onSave }: DraftEditFormProps) {
  const [name, setName] = useState(draft.name);
  const [category, setCategory] = useState<ClothingCategory>(draft.category);
  const [subCategory, setSubCategory] = useState(draft.sub_category ?? "");
  const [primaryColor, setPrimaryColor] = useState(draft.colors[0] ?? "");
  const [secondaryColor, setSecondaryColor] = useState(draft.colors[1] ?? "");
  const [pattern, setPattern] = useState(draft.pattern);
  const [formality, setFormality] = useState(draft.formality);
  const [fit, setFit] = useState(draft.fit ?? "regular");
  const [season, setSeason] = useState<string[]>(draft.season);
  const [occasions, setOccasions] = useState<string[]>(draft.occasions);
  const [material, setMaterial] = useState(draft.material ?? "");
  const [brand, setBrand] = useState(draft.brand ?? "");
  const [size, setSize] = useState(draft.size ?? "");
  const [purchasePrice, setPurchasePrice] = useState(
    draft.purchase_price != null ? String(draft.purchase_price) : "",
  );
  const [isFavorite, setIsFavorite] = useState(draft.is_favorite);
  const [excludeFromRecommendations, setExcludeFromRecommendations] = useState(
    draft.exclude_from_recommendations,
  );

  function toggleSeason(id: string) {
    setSeason((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  function toggleOccasion(id: string) {
    setOccasions((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Name required", "Give this item a name before saving.");
      return;
    }

    const colorsList = [primaryColor.trim(), secondaryColor.trim()].filter(Boolean);
    const parsedPrice = purchasePrice.trim()
      ? Number.parseFloat(purchasePrice)
      : null;

    await onSave({
      name: name.trim(),
      category,
      sub_category: subCategory.trim() || null,
      colors: colorsList,
      pattern: pattern.trim() || "solid",
      formality,
      fit,
      season,
      occasions,
      material: material.trim() || null,
      brand: brand.trim() || null,
      size: size.trim() || null,
      purchase_price:
        parsedPrice != null && !Number.isNaN(parsedPrice) ? parsedPrice : null,
      is_favorite: isFavorite,
      exclude_from_recommendations: excludeFromRecommendations,
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>AI suggested</Text>

      <FormField label="Name" value={name} onChangeText={setName} />

      <Text style={styles.fieldLabel}>Category</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((value) => (
          <Chip
            key={value}
            label={CATEGORY_LABELS[value]}
            selected={category === value}
            onPress={() => {
              setCategory(value);
              if (!SUB_CATEGORY_OPTIONS[value].includes(subCategory)) {
                setSubCategory("");
              }
            }}
          />
        ))}
      </View>

      <Text style={styles.fieldLabel}>Clothing type</Text>
      <View style={styles.chipRow}>
        {SUB_CATEGORY_OPTIONS[category].map((value) => (
          <Chip
            key={value}
            label={value}
            selected={subCategory === value}
            onPress={() => setSubCategory(value)}
          />
        ))}
      </View>

      <FormField label="Main colour" value={primaryColor} onChangeText={setPrimaryColor} />
      <FormField
        label="Secondary colour"
        value={secondaryColor}
        onChangeText={setSecondaryColor}
        placeholder="Optional"
      />
      <FormField label="Pattern" value={pattern} onChangeText={setPattern} />

      <Text style={styles.fieldLabel}>Formality</Text>
      <View style={styles.chipRow}>
        {FORMALITY_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={formality === option.value}
            onPress={() => setFormality(option.value)}
          />
        ))}
      </View>

      <Text style={styles.fieldLabel}>Fit</Text>
      <View style={styles.chipRow}>
        {FIT_OPTIONS.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selected={fit === option.id}
            onPress={() => setFit(option.id)}
          />
        ))}
      </View>

      <Text style={styles.fieldLabel}>Season</Text>
      <View style={styles.chipRow}>
        {SEASON_OPTIONS.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selected={season.includes(option.id)}
            onPress={() => toggleSeason(option.id)}
          />
        ))}
      </View>

      <Text style={styles.fieldLabel}>Occasions</Text>
      <View style={styles.chipRow}>
        {PICKABLE_OCCASIONS.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selected={occasions.includes(option.id)}
            onPress={() => toggleOccasion(option.id)}
          />
        ))}
      </View>

      <FormField label="Material" value={material} onChangeText={setMaterial} />
      <FormField label="Brand" value={brand} onChangeText={setBrand} placeholder="Optional" />

      <Text style={styles.sectionTitle}>Optional details</Text>

      <FormField label="Size" value={size} onChangeText={setSize} placeholder="e.g. M, 32, UK 9" />
      <FormField
        label="Purchase price"
        value={purchasePrice}
        onChangeText={setPurchasePrice}
        keyboardType="decimal-pad"
        placeholder="Optional"
      />

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Favourite</Text>
        <Switch value={isFavorite} onValueChange={setIsFavorite} />
      </View>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Never recommend</Text>
        <Switch
          value={excludeFromRecommendations}
          onValueChange={setExcludeFromRecommendations}
        />
      </View>

      <Button title="Save item" loading={saving} onPress={() => void handleSave()} />
    </ScrollView>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
    gap: 16,
  },
  sectionTitle: {
    marginTop: 8,
    fontSize: 16,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
  },
  fieldLabel: {
    fontSize: 13,
    color: colors.inkMuted,
    fontFamily: fonts.sansMedium,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    fontSize: 13,
    color: colors.ink,
    fontFamily: fonts.sansMedium,
  },
  chipTextSelected: {
    color: colors.primaryForeground,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 15,
    color: colors.ink,
    fontFamily: fonts.sans,
  },
});
