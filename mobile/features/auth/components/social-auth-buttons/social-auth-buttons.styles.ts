import { StyleSheet } from "react-native";
import { colors, fonts, radius } from "@/theme";

export const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  button: {
    height: 52,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  pressed: {
    backgroundColor: colors.surfaceHover,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    color: colors.ink,
  },
});
