import { StyleSheet } from "react-native";
import { colors, fonts } from "@/lib/theme";

export const styles = StyleSheet.create({
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
