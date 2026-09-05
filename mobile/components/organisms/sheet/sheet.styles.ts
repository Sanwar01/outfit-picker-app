import { StyleSheet } from "react-native";
import { colors, radius } from "@/lib/theme";

export const styles = StyleSheet.create({
  sheet: {
    flexGrow: 1,
    marginTop: -28,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: 24,
    paddingTop: 28,
    boxShadow: "0px -8px 30px rgba(0,0,0,0.06)",
  },
});
