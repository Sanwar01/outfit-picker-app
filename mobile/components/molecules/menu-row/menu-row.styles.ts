import { StyleSheet } from "react-native";
import { colors, fonts } from "@/lib/theme";

export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pressed: {
    backgroundColor: colors.surfaceHover,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.ink,
    flexShrink: 1,
  },
  description: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 14,
    color: colors.inkMuted,
    marginTop: 1,
  },
});
