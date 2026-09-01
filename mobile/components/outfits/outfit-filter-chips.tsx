import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import {
  OUTFIT_FILTER_OPTIONS,
  type OutfitListFilter,
} from "@shared/outfits/outfit-display";
import { colors, fonts } from "@/lib/theme";

type OutfitFilterChipsProps = {
  value: OutfitListFilter;
  onChange: (value: OutfitListFilter) => void;
};

export function OutfitFilterChips({ value, onChange }: OutfitFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {OUTFIT_FILTER_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
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
});
