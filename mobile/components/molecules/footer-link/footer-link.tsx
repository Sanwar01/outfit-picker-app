import { Link, type Href } from "expo-router";
import { Text, View } from "react-native";
import { styles } from "./footer-link.styles";

type FooterLinkProps = {
  prompt: string;
  actionLabel: string;
  href: Href;
};

export function FooterLink({ prompt, actionLabel, href }: FooterLinkProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.prompt}>{prompt} </Text>
      <Link href={href}>
        <Text style={styles.action}>{actionLabel}</Text>
      </Link>
    </View>
  );
}
