import { Link, type Href } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/lib/theme";

type AuthFooterLinkProps = {
  prompt: string;
  actionLabel: string;
  href: Href;
};

export function AuthFooterLink({
  prompt,
  actionLabel,
  href,
}: AuthFooterLinkProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.prompt}>{prompt} </Text>
      <Link href={href}>
        <Text style={styles.action}>{actionLabel}</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  prompt: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: "#8b8178",
  },
  action: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.brand,
  },
});
