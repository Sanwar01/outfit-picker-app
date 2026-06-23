import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ClothingCategory } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: outfitId } = await params;
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();

    if (!claimsData?.claims?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = claimsData.claims.sub as string;
    const body = await request.json();
    const clothingItemId = body.clothing_item_id as string | undefined;

    if (!clothingItemId) {
      return NextResponse.json(
        { error: "clothing_item_id required" },
        { status: 400 }
      );
    }

    const { data: outfit, error: outfitError } = await supabase
      .from("outfits")
      .select("id")
      .eq("id", outfitId)
      .eq("user_id", userId)
      .single();

    if (outfitError || !outfit) {
      return NextResponse.json({ error: "Outfit not found" }, { status: 404 });
    }

    const { data: clothingItem, error: itemError } = await supabase
      .from("clothing_items")
      .select("id, category")
      .eq("id", clothingItemId)
      .eq("user_id", userId)
      .single();

    if (itemError || !clothingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const { data: existingItems } = await supabase
      .from("outfit_items")
      .select("clothing_item_id, slot")
      .eq("outfit_id", outfitId);

    const alreadyIncluded = (existingItems ?? []).some(
      (row) => row.clothing_item_id === clothingItemId
    );

    if (alreadyIncluded) {
      return NextResponse.json({ success: true, alreadyIncluded: true });
    }

    const slot = clothingItem.category as ClothingCategory;
    const sameSlotItem = (existingItems ?? []).find((row) => row.slot === slot);

    if (sameSlotItem) {
      const { error: removeError } = await supabase
        .from("outfit_items")
        .delete()
        .eq("outfit_id", outfitId)
        .eq("clothing_item_id", sameSlotItem.clothing_item_id);

      if (removeError) {
        return NextResponse.json({ error: removeError.message }, { status: 500 });
      }
    }

    const { error: insertError } = await supabase.from("outfit_items").insert({
      outfit_id: outfitId,
      clothing_item_id: clothingItemId,
      slot,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Add outfit item error:", error);
    return NextResponse.json(
      { error: "Failed to add item to outfit" },
      { status: 500 }
    );
  }
}
