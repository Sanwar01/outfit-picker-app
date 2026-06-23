import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { tagClothingFromImage } from "@/lib/ai/tag-clothing";
import type { ClothingItem } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();

    if (!claimsData?.claims?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = claimsData.claims.sub as string;
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
        { status: 500 }
      );
    }

    const tags = await tagClothingFromImage(signedUrlData.signedUrl);

    const { data: updated, error: updateError } = await supabase
      .from("clothing_items")
      .update({
        name: tags.name,
        category: tags.category,
        sub_category: tags.sub_category,
        colors: tags.colors,
        season: tags.season,
        pattern: tags.pattern,
        formality: tags.formality,
        ai_confidence: tags.confidence,
      })
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

    return NextResponse.json(updated as ClothingItem);
  } catch (error) {
    console.error("Tag clothing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Tagging failed" },
      { status: 500 }
    );
  }
}
