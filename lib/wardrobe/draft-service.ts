import type { SupabaseClient } from "@supabase/supabase-js";
import { tagClothingFromImage } from "@/lib/ai/tag-clothing";
import { isGeminiUnavailableError } from "@/lib/ai/gemini";
import { createAdminClient } from "@/lib/supabase/admin";
import { clothingTagsToUpdate } from "@/lib/wardrobe/apply-clothing-tags";
import { DRAFT_NOTES_MARKER, isDraftItem } from "@/lib/wardrobe/draft-constants";
import type { ClothingDraftResponse } from "@/lib/wardrobe/drafts";
import { pickDraftUpdate } from "@/lib/wardrobe/draft-update";
import type { ClothingItem, Database } from "@/lib/types/database";

type RouteSupabase = SupabaseClient<Database>;

function listDraftsQuery(supabase: RouteSupabase, userId: string) {
  return supabase
    .from("clothing_items")
    .select("*")
    .eq("user_id", userId)
    .eq("notes", DRAFT_NOTES_MARKER)
    .order("created_at", { ascending: true });
}

export async function getSignedWardrobeUrl(
  imagePath: string,
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("wardrobe-images")
    .createSignedUrl(imagePath, 3600);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function toDraftResponse(
  item: ClothingItem,
  signedImageUrl: string,
): Promise<ClothingDraftResponse> {
  return {
    ...item,
    signedImageUrl,
  };
}

function draftItemQuery(
  supabase: RouteSupabase,
  userId: string,
  itemId: string,
) {
  return supabase
    .from("clothing_items")
    .select("*")
    .eq("id", itemId)
    .eq("user_id", userId);
}

export async function fetchDraftForUser(
  supabase: RouteSupabase,
  userId: string,
  itemId: string,
): Promise<ClothingDraftResponse | null> {
  const { data, error } = await draftItemQuery(supabase, userId, itemId).single();

  if (error || !data || !isDraftItem(data)) return null;

  const signedImageUrl = await getSignedWardrobeUrl(data.image_url);
  if (!signedImageUrl) return null;

  return toDraftResponse(data as ClothingItem, signedImageUrl);
}

export async function runDraftTagging(
  supabase: RouteSupabase,
  userId: string,
  itemId: string,
): Promise<ClothingItem | null> {
  const { data: item, error } = await draftItemQuery(
    supabase,
    userId,
    itemId,
  ).single();

  if (error || !item || !isDraftItem(item)) return null;

  const signedImageUrl = await getSignedWardrobeUrl(item.image_url);
  if (!signedImageUrl) {
    return item as ClothingItem;
  }

  try {
    const tags = await tagClothingFromImage(signedImageUrl);
    const { data: updated, error: updateError } = await supabase
      .from("clothing_items")
      .update(pickDraftUpdate(clothingTagsToUpdate(tags)))
      .eq("id", itemId)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError || !updated) return item as ClothingItem;
    return updated as ClothingItem;
  } catch (error) {
    if (isGeminiUnavailableError(error)) {
      console.warn("AI tagging unavailable for draft:", error);
    } else {
      console.error("Draft tagging error:", error);
    }

    return item as ClothingItem;
  }
}

export function buildDraftInsert(input: {
  id: string;
  userId: string;
  imagePath: string;
}) {
  return {
    id: input.id,
    user_id: input.userId,
    image_url: input.imagePath,
    name: "Clothing item",
    category: "top" as const,
    status: "archived" as const,
    notes: DRAFT_NOTES_MARKER,
  };
}

export function buildDraftConfirmUpdate() {
  return pickDraftUpdate({
    status: "active",
    notes: null,
  });
}

export async function fetchAllDraftsForUser(
  supabase: RouteSupabase,
  userId: string,
  itemIds?: string[],
): Promise<ClothingDraftResponse[]> {
  let query = listDraftsQuery(supabase, userId);

  if (itemIds && itemIds.length > 0) {
    query = query.in("id", itemIds);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const drafts: ClothingDraftResponse[] = [];

  for (const row of data) {
    if (!isDraftItem(row)) continue;
    const signedImageUrl = await getSignedWardrobeUrl(row.image_url);
    if (!signedImageUrl) continue;
    drafts.push(await toDraftResponse(row as ClothingItem, signedImageUrl));
  }

  return drafts;
}

export async function confirmDraftsForUser(
  supabase: RouteSupabase,
  userId: string,
  itemIds: string[],
): Promise<ClothingItem[]> {
  if (itemIds.length === 0) return [];

  const { data, error } = await supabase
    .from("clothing_items")
    .update(buildDraftConfirmUpdate())
    .eq("user_id", userId)
    .eq("notes", DRAFT_NOTES_MARKER)
    .in("id", itemIds)
    .select();

  if (error || !data) return [];
  return data as ClothingItem[];
}
