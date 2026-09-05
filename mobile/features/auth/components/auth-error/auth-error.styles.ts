import { StyleSheet } from "react-native";
import { colors, fonts } from "@/theme";

export const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#fef2f2",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.destructive,
  },
});
