import { useState } from "react";
import { Alert, ScrollView, Switch, Text, View } from "react-native";
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
import { Button } from "@/components/atoms";
import { Chip, TextField } from "@/components/molecules";
import { styles } from "./draft-edit-form.styles";

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
  saveButtonTitle?: string;
  onSave: (patch: ClothingDraftPatch) => Promise<void>;
};

export function DraftEditForm({
  draft,
  saving,
  saveButtonTitle = "Save item",
  onSave,
}: DraftEditFormProps) {
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
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  function toggleOccasion(id: string) {
    setOccasions((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Name required", "Give this item a name before saving.");
      return;
    }

    const colorsList = [primaryColor.trim(), secondaryColor.trim()].filter(
      Boolean,
    );
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
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.sectionTitle}>AI suggested</Text>

      <TextField label="Name" value={name} onChangeText={setName} />

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

      <TextField
        label="Main colour"
        value={primaryColor}
        onChangeText={setPrimaryColor}
      />
      <TextField
        label="Secondary colour"
        value={secondaryColor}
        onChangeText={setSecondaryColor}
        placeholder="Optional"
      />
      <TextField label="Pattern" value={pattern} onChangeText={setPattern} />

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

      <TextField
        label="Material"
        value={material}
        onChangeText={setMaterial}
      />
      <TextField
        label="Brand"
        value={brand}
        onChangeText={setBrand}
        placeholder="Optional"
      />

      <Text style={styles.sectionTitle}>Optional details</Text>

      <TextField
        label="Size"
        value={size}
        onChangeText={setSize}
        placeholder="e.g. M, 32, UK 9"
      />
      <TextField
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

      <Button
        title={saveButtonTitle}
        loading={saving}
        onPress={() => void handleSave()}
      />
    </ScrollView>
  );
}
