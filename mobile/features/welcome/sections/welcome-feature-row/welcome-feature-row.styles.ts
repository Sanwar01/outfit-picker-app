import { StyleSheet } from "react-native";
import { colors, fonts, radius } from "@/lib/theme";

export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  tile: {
    width: 44,
    height: 44,
    borderRadius: radius.tile,
    backgroundColor: colors.creamDeep,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    paddingTop: 2,
  },
  title: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: colors.ink,
    lineHeight: 21,
  },
  body: {
    marginTop: 2,
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkMuted,
  },
});
