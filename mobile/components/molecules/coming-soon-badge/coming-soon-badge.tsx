import { Text, View } from "react-native";
import { styles } from "./coming-soon-badge.styles";

type ComingSoonBadgeProps = {
  compact?: boolean;
};

export function ComingSoonBadge({ compact }: ComingSoonBadgeProps) {
  return (
    <View style={[styles.badge, compact && styles.compact]}>
      <Text style={[styles.text, compact && styles.compactText]}>
        {compact ? "Soon" : "Coming soon"}
      </Text>
    </View>
  );
}
