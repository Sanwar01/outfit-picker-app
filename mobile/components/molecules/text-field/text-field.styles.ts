import { StyleSheet } from "react-native";
import { colors, fonts, radius } from "@/lib/theme";

export const styles = StyleSheet.create({
  labeledWrap: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: colors.inkMuted,
    fontFamily: fonts.sansMedium,
  },
  iconWrap: {
    position: "relative",
    justifyContent: "center",
  },
  leftIcon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  labeledInput: {
    minHeight: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink,
    fontFamily: fonts.sans,
  },
  iconInput: {
    height: 52,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surface,
    paddingLeft: 44,
    paddingRight: 16,
    fontSize: 15,
    color: colors.ink,
    fontFamily: fonts.sans,
  },
  inputWithToggle: {
    paddingRight: 44,
  },
  eye: {
    position: "absolute",
    right: 16,
    zIndex: 1,
  },
});
