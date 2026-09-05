import { StyleSheet } from "react-native";
import { colors, fonts } from "@/theme";

export const styles = StyleSheet.create({
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
  chipSelectedInk: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipSelectedBrand: {
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
