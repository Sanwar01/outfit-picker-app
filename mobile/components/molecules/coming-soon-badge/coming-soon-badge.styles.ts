import { StyleSheet } from "react-native";
import { colors, fonts } from "@/theme";

export const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.brandSubtle,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    flexShrink: 0,
  },
  compact: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  text: {
    fontFamily: fonts.sansSemi,
    fontSize: 9,
    letterSpacing: 0.2,
    color: colors.brandHover,
  },
  compactText: {
    fontSize: 9,
  },
});
