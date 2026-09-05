import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/atoms";
import { colors } from "@/theme";
import { styles } from "./empty-state.styles";

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  actionTitle?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon,
  title,
  body,
  actionTitle,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={32} color={colors.brand} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {actionTitle && onAction ? (
        <Button title={actionTitle} onPress={onAction} style={styles.button} />
      ) : null}
    </View>
  );
}
