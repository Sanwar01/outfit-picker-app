import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ClothingItem } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();

    if (!claimsData?.claims?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = claimsData.claims.sub as string;
    const body = await request.json();
    const { itemIds, outfitId } = body as {
      itemIds: string[];
      outfitId?: string;
    };

    if (!itemIds?.length) {
      return NextResponse.json({ error: "itemIds required" }, { status: 400 });
    }

    const now = new Date().toISOString();

    await supabase.from("wear_log").insert({
      user_id: userId,
      outfit_id: outfitId ?? null,
      worn_at: now,
    });

    for (const itemId of itemIds) {
      const { data: item } = await supabase
        .from("clothing_items")
        .select("wear_count")
        .eq("id", itemId)
        .eq("user_id", userId)
        .single();

      if (item) {
        const clothing = item as Pick<ClothingItem, "wear_count">;
        await supabase
          .from("clothing_items")
          .update({
            wear_count: (clothing.wear_count ?? 0) + 1,
            last_worn_at: now,
          })
          .eq("id", itemId)
          .eq("user_id", userId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wear outfit error:", error);
    return NextResponse.json({ error: "Failed to log outfit" }, { status: 500 });
  }
}
