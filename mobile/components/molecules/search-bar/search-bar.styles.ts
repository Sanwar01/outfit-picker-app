import { StyleSheet } from "react-native";
import { colors, fonts, radius } from "@/lib/theme";

export const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    gap: 8,
  },
  icon: {
    marginRight: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    fontFamily: fonts.sans,
    paddingVertical: 10,
  },
});
