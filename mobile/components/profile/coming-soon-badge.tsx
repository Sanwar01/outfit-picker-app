import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/lib/theme";

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

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.brandSubtle,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    flexShrink: 0,
  },
  compact: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  text: {
    fontFamily: fonts.sansSemi,
    fontSize: 9,
    letterSpacing: 0.2,
    color: colors.brandHover,
  },
  compactText: {
    fontSize: 9,
  },
});
