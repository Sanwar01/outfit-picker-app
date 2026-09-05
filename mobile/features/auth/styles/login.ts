import { StyleSheet } from "react-native";
import { colors, fonts } from "@/theme";

export const styles = StyleSheet.create({
  stack: {
    gap: 16,
    marginBottom: 16,
  },
  form: {
    gap: 12,
  },
  options: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 8,
  },
  forgot: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.brand,
  },
  footer: {
    marginTop: 24,
  },
});
