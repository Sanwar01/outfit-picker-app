import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSignedImageUrls } from "@/lib/storage";
import type { ClothingCategory, ClothingItem, Outfit } from "@/lib/types/database";
import type { Json } from "@/lib/types/database";
import type { WeatherSnapshot } from "@/lib/weather/open-meteo";

export const dynamic = "force-dynamic";

type OutfitItemRow = {
  outfit_id: string;
  clothing_item_id: string;
  slot: ClothingCategory;
};

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();

    if (!claimsData?.claims?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = claimsData.claims.sub as string;
    const { searchParams } = new URL(request.url);
    const favoritesOnly = searchParams.get("favorites") === "true";
    const itemId = searchParams.get("itemId");

    let outfitIdsForItem: string[] | null = null;

    if (itemId) {
      const { data: links, error: linksError } = await supabase
        .from("outfit_items")
        .select("outfit_id")
        .eq("clothing_item_id", itemId);

      if (linksError) {
        return NextResponse.json({ error: linksError.message }, { status: 500 });
      }

      outfitIdsForItem = [...new Set((links ?? []).map((row) => row.outfit_id))];

      if (outfitIdsForItem.length === 0) {
        return NextResponse.json([]);
      }
    }

    let query = supabase
      .from("outfits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (favoritesOnly) {
      query = query.eq("is_favorite", true);
    }

    if (outfitIdsForItem) {
      query = query.in("id", outfitIdsForItem);
    }

    const { data: outfits, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const typedOutfits = (outfits ?? []) as Outfit[];
    const outfitIds = typedOutfits.map((o) => o.id);

    if (outfitIds.length === 0) {
      return NextResponse.json([]);
    }

    const { data: outfitItems } = await supabase
      .from("outfit_items")
      .select("*")
      .in("outfit_id", outfitIds);

    const typedOutfitItems = (outfitItems ?? []) as OutfitItemRow[];
    const clothingIds = [
      ...new Set(typedOutfitItems.map((oi) => oi.clothing_item_id)),
    ];

    const { data: clothing } = await supabase
      .from("clothing_items")
      .select("*")
      .in("id", clothingIds);

    const typedClothing = (clothing ?? []) as ClothingItem[];
    const clothingMap = new Map(typedClothing.map((c) => [c.id, c]));
    const imageUrls = await getSignedImageUrls(
      typedClothing.map((c) => c.image_url)
    );

    const enriched = typedOutfits.map((outfit) => {
      const items = typedOutfitItems
        .filter((oi) => oi.outfit_id === outfit.id)
        .map((oi) => clothingMap.get(oi.clothing_item_id))
        .filter((item): item is ClothingItem => !!item);

      return { ...outfit, items, imageUrls };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("List outfits error:", error);
    return NextResponse.json(
      { error: "Failed to load outfits" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();

    if (!claimsData?.claims?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = claimsData.claims.sub as string;
    const body = await request.json();
    const { slots, rationale, weather, name } = body as {
      slots: Record<string, string>;
      rationale: string;
      weather: WeatherSnapshot;
      name?: string;
    };

    if (!slots || !Object.keys(slots).length) {
      return NextResponse.json({ error: "slots required" }, { status: 400 });
    }

    const { data: outfit, error: outfitError } = await supabase
      .from("outfits")
      .insert({
        user_id: userId,
        name: name ?? "Saved outfit",
        weather_snapshot: weather as unknown as Json,
        ai_rationale: rationale,
      })
      .select()
      .single();

    if (outfitError || !outfit) {
      return NextResponse.json(
        { error: outfitError?.message ?? "Failed to save outfit" },
        { status: 500 }
      );
    }

    const resolvedRows = Object.entries(slots).map(([slot, clothingItemId]) => ({
      outfit_id: outfit.id,
      clothing_item_id: clothingItemId,
      slot: slot as ClothingCategory,
    }));

    const { error: itemsError } = await supabase
      .from("outfit_items")
      .insert(resolvedRows);

    if (itemsError) {
      await supabase.from("outfits").delete().eq("id", outfit.id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json(outfit);
  } catch (error) {
    console.error("Save outfit error:", error);
    return NextResponse.json({ error: "Failed to save outfit" }, { status: 500 });
  }
}
