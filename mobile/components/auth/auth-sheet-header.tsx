import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/lib/theme";

type AuthSheetHeaderProps = {
  title: string;
  subtitle: string;
};

export function AuthSheetHeader({ title, subtitle }: AuthSheetHeaderProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: "#8b8178",
  },
});
