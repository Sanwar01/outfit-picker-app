import { StyleSheet } from "react-native";
import { colors, fonts } from "@/theme";

export const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hint: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 10,
  },
});
