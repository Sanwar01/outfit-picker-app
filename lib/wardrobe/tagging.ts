import type { ClothingItem } from "@/lib/types/database";

export type TagClothingResponse = ClothingItem & { retagged: boolean };

export const TAG_UNAVAILABLE_TOAST =
  "Nothing to update right now — your item still looks good as-is.";
