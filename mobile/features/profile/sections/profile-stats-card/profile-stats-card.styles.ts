import { StyleSheet } from "react-native";
import { colors, fonts } from "@/lib/theme";

export const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.ink,
  },
  summary: {
    fontSize: 13,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.page,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
  },
  statLabel: {
    fontSize: 11,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
});
