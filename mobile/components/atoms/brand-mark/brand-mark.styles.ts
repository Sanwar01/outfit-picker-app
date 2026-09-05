import { StyleSheet } from "react-native";
import { colors, fonts } from "@/lib/theme";

export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  centered: {
    flexDirection: "column",
    gap: 12,
  },
  centeredCopy: {
    alignItems: "center",
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 24,
    lineHeight: 28,
    color: colors.ink,
  },
  tagline: {
    marginTop: 4,
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.brand,
  },
});
