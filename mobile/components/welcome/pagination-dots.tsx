import { StyleSheet, View } from "react-native";
import { colors } from "@/lib/theme";

type PaginationDotsProps = {
  total: number;
  active: number;
};

export function PaginationDots({ total, active }: PaginationDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === active && styles.dotActive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.borderStrong,
  },
  dotActive: {
    backgroundColor: colors.brand,
    width: 9,
    height: 9,
    borderRadius: 5,
  },
});
