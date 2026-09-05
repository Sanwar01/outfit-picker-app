import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  formatUsageFraction,
  planLabel,
  type UsageSnapshot,
} from "@/lib/billing";
import { Button } from "@/components/ui/primitives";
import { colors, fonts } from "@/lib/theme";

type ProfileUsageCardProps = {
  usage: UsageSnapshot;
};

function UsageRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function isNearLimit(meter: UsageSnapshot["wardrobe"]): boolean {
  if (meter.limit === null) return false;
  return meter.used / meter.limit >= 0.7;
}

export function ProfileUsageCard({ usage }: ProfileUsageCardProps) {
  const isFree = usage.plan === "free";
  const showNudge =
    isFree &&
    (isNearLimit(usage.wardrobe) ||
      isNearLimit(usage.aiTags) ||
      isNearLimit(usage.outfitShuffleDaily) ||
      isNearLimit(usage.outfitAiDaily));

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Plan & limits</Text>
        <View style={styles.planPill}>
          <Text style={styles.planPillText}>{planLabel(usage.plan)}</Text>
        </View>
      </View>
      <Text style={styles.summary}>
        {isFree
          ? "How much of your Free plan you’ve used. Daily and monthly limits refresh automatically."
          : "Your plan allowances for this period."}
      </Text>

      <UsageRow
        label="Wardrobe items"
        value={formatUsageFraction(usage.wardrobe)}
        hint="Active items in your closet"
      />
      <View style={styles.divider} />
      <UsageRow
        label="AI tagging"
        value={formatUsageFraction(usage.aiTags)}
        hint="Photo analysis this month"
      />
      <View style={styles.divider} />
      <UsageRow
        label="Today’s AI pick"
        value={formatUsageFraction(usage.outfitAiDaily)}
        hint="First styled look of the day"
      />
      <View style={styles.divider} />
      <UsageRow
        label="AI shuffles"
        value={formatUsageFraction(usage.outfitShuffleDaily)}
        hint="Extra AI looks today"
      />

      {isFree ? (
        <View style={styles.ctaBlock}>
          {showNudge ? (
            <Text style={styles.nudge}>
              You’re close to a Free limit — Pro removes the ceiling.
            </Text>
          ) : null}
          <Button
            title="Upgrade to Pro"
            onPress={() => router.push("/profile/upgrade")}
          />
          <Pressable
            onPress={() => router.push("/profile/upgrade")}
            accessibilityRole="button"
          >
            <Text style={styles.ctaLink}>See what’s included</Text>
          </Pressable>
        </View>
      ) : null}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.ink,
  },
  planPill: {
    backgroundColor: colors.cream,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  planPillText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.ink,
  },
  summary: {
    fontSize: 13,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.ink,
  },
  rowHint: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
  },
  rowValue: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  ctaBlock: {
    marginTop: 6,
    gap: 10,
  },
  nudge: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkMuted,
  },
  ctaLink: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.brand,
    textAlign: "center",
  },
});
