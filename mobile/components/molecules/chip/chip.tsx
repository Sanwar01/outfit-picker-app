import type { ReactNode } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { styles } from "./chip.styles";

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  selectedTone?: "ink" | "brand";
};

export function Chip({
  label,
  selected = false,
  onPress,
  selectedTone = "ink",
}: ChipProps) {
  const selectedStyle =
    selectedTone === "brand" ? styles.chipSelectedBrand : styles.chipSelectedInk;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && selectedStyle]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {children}
    </ScrollView>
  );
}
