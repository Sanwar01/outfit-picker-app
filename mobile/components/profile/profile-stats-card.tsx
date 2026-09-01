import { StyleSheet, Text, View } from "react-native";
import { profileStatsSummary } from "@/lib/profile-display";
import { colors, fonts } from "@/lib/theme";

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

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.ink,
  },
  summary: {
    fontSize: 13,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.page,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
  },
  statLabel: {
    fontSize: 11,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
  },
});
