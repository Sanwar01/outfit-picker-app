export const FIT_OPTIONS = [
  { id: "regular", label: "Regular fit" },
  { id: "slim", label: "Slim fit" },
  { id: "relaxed", label: "Relaxed fit" },
  { id: "oversized", label: "Oversized" },
] as const;

export type ClothingFit = (typeof FIT_OPTIONS)[number]["id"];

export function fitLabel(fit: string | null | undefined): string {
  if (!fit) return "Regular fit";
  const match = FIT_OPTIONS.find((option) => option.id === fit);
  return match?.label ?? "Regular fit";
}
