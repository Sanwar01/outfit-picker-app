import { Text, View } from "react-native";
import { styles } from "./sheet-header.styles";

type SheetHeaderProps = {
  title: string;
  subtitle: string;
};

export function SheetHeader({ title, subtitle }: SheetHeaderProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}
