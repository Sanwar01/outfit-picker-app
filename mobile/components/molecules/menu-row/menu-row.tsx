import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { ComingSoonBadge } from "../coming-soon-badge";
import { colors } from "@/lib/theme";
import { styles } from "./menu-row.styles";

type MenuRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  comingSoon?: boolean;
  onPress?: () => void;
};

export function MenuRow({
  icon,
  title,
  description,
  comingSoon,
  onPress,
}: MenuRowProps) {
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
