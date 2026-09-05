import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "@/services/api";
import type {
  ClothingDraftListResponse,
  ClothingDraftPatch,
  ClothingDraftResponse,
  ConfirmAllDraftsResponse,
} from "@shared/wardrobe/drafts";
import type { ClothingItem } from "@shared/types/database";

export async function createClothingDraft(input: {
  itemId: string;
  imagePath: string;
}): Promise<
  { ok: true; data: ClothingDraftResponse } | { ok: false; error: string }
> {
  return apiPost<ClothingDraftResponse>("/api/clothing/drafts", input);
}

export async function listClothingDrafts(itemIds?: string[]) {
  const query =
    itemIds && itemIds.length > 0
      ? `?ids=${encodeURIComponent(itemIds.join(","))}`
      : "";
  return apiGet<ClothingDraftListResponse>(`/api/clothing/drafts${query}`);
}

export async function getClothingDraft(id: string) {
  return apiGet<ClothingDraftResponse>(`/api/clothing/drafts/${id}`);
}

export async function updateClothingDraft(id: string, patch: ClothingDraftPatch) {
  return apiPatch<ClothingDraftResponse>(`/api/clothing/drafts/${id}`, patch);
}

export async function confirmClothingDraft(id: string) {
  return apiPost<ClothingItem>(`/api/clothing/drafts/${id}/confirm`);
}

export async function confirmAllClothingDrafts(itemIds?: string[]) {
  return apiPost<ConfirmAllDraftsResponse>("/api/clothing/drafts/confirm-all", {
    itemIds,
  });
}

export async function discardClothingDraft(id: string) {
  return apiDelete(`/api/clothing/drafts/${id}`);
}
