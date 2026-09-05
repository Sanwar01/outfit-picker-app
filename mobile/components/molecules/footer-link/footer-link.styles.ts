import { StyleSheet } from "react-native";
import { colors, fonts } from "@/theme";

export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  prompt: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: "#8b8178",
  },
  action: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.brand,
  },
});
