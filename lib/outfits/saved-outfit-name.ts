const DEFAULT_NAME = "Saved outfit";

export function defaultSavedOutfitName(date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function resolveSavedOutfitName(
  name?: string | null,
  date = new Date(),
): string {
  const trimmed = name?.trim();
  if (trimmed && trimmed !== DEFAULT_NAME) return trimmed;
  return defaultSavedOutfitName(date);
}

export function displaySavedOutfitName(outfit: {
  name?: string | null;
  created_at?: string | null;
}): string {
  const date = outfit.created_at ? new Date(outfit.created_at) : new Date();
  return resolveSavedOutfitName(outfit.name, date);
}
