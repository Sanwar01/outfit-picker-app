import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createRouteClient } from "@/lib/supabase/route-client";
import { createAdminClient } from "@/lib/supabase/admin";
import { isGeminiUnavailableError } from "@/lib/ai/gemini";
import { tagClothingFromImage } from "@/lib/ai/tag-clothing";
import { getRouteUserId } from "@/lib/api/route-auth";
import { clothingTagsToUpdate } from "@/lib/wardrobe/apply-clothing-tags";
import type { TagClothingResponse } from "@/lib/wardrobe/tagging";
import type { ClothingItem } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteClient(request);
    const userId = await getRouteUserId(supabase);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const itemId = body.itemId as string | undefined;

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const { data: item, error: fetchError } = await supabase
      .from("clothing_items")
      .select("*")
      .eq("id", itemId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const clothingItem = item as ClothingItem;

    const admin = createAdminClient();
    const { data: signedUrlData, error: signedUrlError } = await admin.storage
      .from("wardrobe-images")
      .createSignedUrl(clothingItem.image_url, 3600);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      return NextResponse.json(
        { error: "Failed to create signed URL" },
        { status: 500 },
      );
    }

    let tags;
    try {
      tags = await tagClothingFromImage(signedUrlData.signedUrl);
    } catch (error) {
      if (isGeminiUnavailableError(error)) {
        console.warn("AI tagging unavailable, keeping existing item:", error);
        const response: TagClothingResponse = {
          ...clothingItem,
          retagged: false,
        };
        return NextResponse.json(response);
      }
      throw error;
    }

    const { data: updated, error: updateError } = await supabase
      .from("clothing_items")
      .update(clothingTagsToUpdate(tags))
      .eq("id", itemId)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { error: "Failed to update item" },
        { status: 500 }
      );
    }

    const response: TagClothingResponse = {
      ...(updated as ClothingItem),
      retagged: true,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Tag clothing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Tagging failed" },
      { status: 500 }
    );
  }
}
