import type { StyleVibe } from "@/lib/types/clothing";

export function getProfileInitials(
  displayName: string | null,
  email: string,
): string {
  const source = displayName?.trim() || email.split("@")[0] || "?";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function formatStyleVibesLabel(vibes: string[]): string {
  if (!vibes.length) return "Not set";
  return vibes.join(" & ");
}

export function profileTagline(vibes: StyleVibe[]): string | null {
  if (!vibes.length) return null;
  return `${formatStyleVibesLabel(vibes)} style.`;
}
