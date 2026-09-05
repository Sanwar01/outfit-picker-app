import { StyleSheet } from "react-native";
import { colors, fonts } from "@/lib/theme";

export const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.brandSubtle,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
  },
  body: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
});
