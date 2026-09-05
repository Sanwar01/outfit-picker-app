import { Text, View } from "react-native";
import { profileStatsSummary } from "@/lib/profile-display";
import { styles } from "./profile-stats-card.styles";

type ProfileStatsCardProps = {
  wardrobeCount: number;
  outfitCount: number;
  totalWears: number;
};

export function ProfileStatsCard({
  wardrobeCount,
  outfitCount,
  totalWears,
}: ProfileStatsCardProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>Your closet</Text>
      <Text style={styles.summary}>
        {profileStatsSummary({ wardrobeCount, outfitCount, totalWears })}
      </Text>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{wardrobeCount}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{outfitCount}</Text>
          <Text style={styles.statLabel}>Outfits</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalWears}</Text>
          <Text style={styles.statLabel}>Times worn</Text>
        </View>
      </View>
    </View>
  );
}
