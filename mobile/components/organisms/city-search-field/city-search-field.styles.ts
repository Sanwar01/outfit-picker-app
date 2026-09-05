import { StyleSheet } from "react-native";
import { colors, fonts, radius } from "@/lib/theme";

export const styles = StyleSheet.create({
  field: {
    position: "relative",
    justifyContent: "center",
  },
  icon: {
    position: "absolute",
    left: 14,
    zIndex: 1,
  },
  input: {
    height: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.page,
    paddingLeft: 40,
    paddingRight: 40,
    fontSize: 15,
    color: colors.ink,
    fontFamily: fonts.sans,
  },
  trailing: {
    position: "absolute",
    right: 14,
  },
  dropdown: {
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.surfaceHover,
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    lineHeight: 18,
    color: colors.ink,
  },
});
