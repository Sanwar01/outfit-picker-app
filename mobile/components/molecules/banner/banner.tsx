import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/lib/theme";
import { styles } from "./banner.styles";

type BannerProps = {
  title: string;
  body: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Banner({ title, body, onPress, style }: BannerProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.banner,
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
    >
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.brand} />
    </Pressable>
  );
}
