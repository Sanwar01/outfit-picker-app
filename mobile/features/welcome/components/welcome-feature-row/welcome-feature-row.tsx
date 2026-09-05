import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import type { WelcomeFeatureIcon } from "@/theme/brand";
import { colors } from "@/theme";
import { styles } from "./welcome-feature-row.styles";

const ICONS: Record<WelcomeFeatureIcon, keyof typeof Ionicons.glyphMap> = {
  shirt: "shirt-outline",
  sparkles: "sparkles-outline",
  weather: "partly-sunny-outline",
};

type WelcomeFeatureRowProps = {
  icon: WelcomeFeatureIcon;
  title: string;
  body: string;
};

export function WelcomeFeatureRow({ icon, title, body }: WelcomeFeatureRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.tile}>
        <Ionicons name={ICONS[icon]} size={22} color={colors.brand} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
}
