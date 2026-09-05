import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import {
  formatUsageFraction,
  planLabel,
  type UsageSnapshot,
} from "@/services/billing";
import { Button } from "@/components/atoms";
import { styles } from "./profile-usage-card.styles";

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
