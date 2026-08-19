import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/lib/theme";
import { ComingSoonBadge } from "@/components/profile/coming-soon-badge";

type ProfileMenuRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  comingSoon?: boolean;
  onPress?: () => void;
};

export function ProfileMenuRow({
  icon,
  title,
  description,
  comingSoon,
  onPress,
}: ProfileMenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={16} color={colors.inkMuted} />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {comingSoon ? <ComingSoonBadge compact /> : null}
        </View>
        <Text style={styles.description} numberOfLines={1}>
          {description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={colors.inkFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pressed: {
    backgroundColor: colors.surfaceHover,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.ink,
    flexShrink: 1,
  },
  description: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 14,
    color: colors.inkMuted,
    marginTop: 1,
  },
});
