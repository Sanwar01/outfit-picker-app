import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/lib/theme";

export function AuthError({ message }: { message: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.error}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#fef2f2",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.destructive,
  },
});
