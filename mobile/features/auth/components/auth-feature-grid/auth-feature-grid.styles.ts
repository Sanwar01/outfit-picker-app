import { StyleSheet } from "react-native";
import { colors, fonts, radius } from "@/theme";

export const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: 12,
  },
  item: {
    flex: 1,
    alignItems: "center",
  },
  tile: {
    width: 48,
    height: 48,
    borderRadius: radius.tile,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 2px 8px rgba(0,0,0,0.06)",
  },
  label: {
    marginTop: 8,
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
    color: colors.inkMuted,
  },
  emphasis: {
    fontFamily: fonts.sansSemi,
    color: colors.ink,
  },
});
