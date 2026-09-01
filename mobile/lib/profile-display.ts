export function getProfileInitials(
  displayName: string | null | undefined,
  email: string,
): string {
  const source = displayName?.trim() || email.split("@")[0] || "?";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function getTimeGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getProfileFirstName(
  displayName: string | null | undefined,
  email: string,
): string {
  const trimmed = displayName?.trim();
  if (trimmed) return trimmed.split(/\s+/)[0] ?? trimmed;
  const local = email.split("@")[0];
  return local || "there";
}

export function formatStyleVibesLabel(vibes: string[]): string {
  if (!vibes.length) return "Not set";
  return vibes.join(" & ");
}

export function profileTagline(vibes: string[]): string | null {
  if (!vibes.length) return null;
  return `${formatStyleVibesLabel(vibes)} style. Always improving.`;
}

export type ProfileCompletionIssue = "location" | "vibes";

export function getProfileCompletionIssues(profile: {
  location_city?: string | null;
  style_vibes?: string[];
} | null): ProfileCompletionIssue[] {
  if (!profile) return ["location", "vibes"];

  const issues: ProfileCompletionIssue[] = [];
  if (!profile.location_city?.trim()) issues.push("location");
  if (!profile.style_vibes?.length) issues.push("vibes");
  return issues;
}

export function profileCompletionMessage(
  issues: ProfileCompletionIssue[],
): string {
  if (issues.includes("location") && issues.includes("vibes")) {
    return "Add your city and style vibes for better daily outfit picks.";
  }
  if (issues.includes("location")) {
    return "Add your city so Today can match outfits to the weather.";
  }
  return "Choose style vibes so recommendations fit your taste.";
}

export function profileStatsSummary(stats: {
  wardrobeCount: number;
  outfitCount: number;
  totalWears: number;
}): string {
  const parts = [
    `${stats.wardrobeCount} item${stats.wardrobeCount === 1 ? "" : "s"}`,
    `${stats.outfitCount} outfit${stats.outfitCount === 1 ? "" : "s"}`,
  ];

  if (stats.totalWears > 0) {
    parts.push(`Worn ${stats.totalWears}×`);
  }

  return parts.join(" · ");
}
