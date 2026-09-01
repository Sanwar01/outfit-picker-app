import type { ClothingItem } from "@/lib/types/database";
import type { DraftCategoryCount } from "@/lib/wardrobe/draft-summary";

export type TaggingStatus = "pending" | "complete" | "failed";

export type ClothingDraftResponse = ClothingItem & {
  signedImageUrl: string;
};

export type ClothingDraftListResponse = {
  items: ClothingDraftResponse[];
  summary: DraftCategoryCount[];
  total: number;
};

export type ConfirmAllDraftsResponse = {
  confirmed: ClothingItem[];
  count: number;
};

export type ClothingDraftPatch = Partial<
  Pick<
    ClothingItem,
    | "name"
    | "category"
    | "sub_category"
    | "colors"
    | "pattern"
    | "season"
    | "formality"
    | "style_tags"
    | "occasions"
    | "material"
    | "brand"
    | "fit"
    | "warmth"
    | "size"
    | "purchase_price"
    | "purchase_date"
    | "is_favorite"
    | "exclude_from_recommendations"
  >
>;
