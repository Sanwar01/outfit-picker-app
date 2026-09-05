import { Text, View } from "react-native";
import { styles } from "./auth-error.styles";

export function AuthError({ message }: { message: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.error}>{message}</Text>
    </View>
  );
}
