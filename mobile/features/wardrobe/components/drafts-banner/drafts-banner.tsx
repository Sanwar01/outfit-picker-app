import { router } from "expo-router";
import { Banner } from "@/components/molecules";
import { styles } from "./drafts-banner.styles";

type DraftsBannerProps = {
  count: number;
};

export function DraftsBanner({ count }: DraftsBannerProps) {
  if (count <= 0) return null;

  return (
    <Banner
      title={`${count} item${count === 1 ? "" : "s"} waiting for review`}
      body="Tap to finish adding them to your wardrobe"
      onPress={() => router.push("/wardrobe/bulk-review")}
      style={styles.banner}
    />
  );
}
