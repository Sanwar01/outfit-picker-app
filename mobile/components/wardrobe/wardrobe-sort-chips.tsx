import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import {
  WARDROBE_SORT_OPTIONS,
  type WardrobeSortValue,
} from "@shared/wardrobe/wardrobe-display";
import { colors, fonts } from "@/lib/theme";

type WardrobeSortChipsProps = {
  value: WardrobeSortValue;
  onChange: (value: WardrobeSortValue) => void;
};

export function WardrobeSortChips({ value, onChange }: WardrobeSortChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {WARDROBE_SORT_OPTIONS.map((option) => {
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
    backgroundColor: colors.brand,
    borderColor: colors.brand,
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
