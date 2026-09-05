import { View } from "react-native";
import { styles } from "./pagination-dots.styles";

type PaginationDotsProps = {
  total: number;
  active: number;
};

export function PaginationDots({ total, active }: PaginationDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
      ))}
    </View>
  );
}
