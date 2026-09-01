import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRouteUserId } from "@/lib/api/route-auth";
import { createRouteClient } from "@/lib/supabase/route-client";
import { buildClothingPatchUpdate } from "@/lib/wardrobe/clothing-patch";
import { isDraftItem } from "@/lib/wardrobe/draft-constants";
import { getSignedWardrobeUrl } from "@/lib/wardrobe/draft-service";
import type { ClothingDraftResponse } from "@/lib/wardrobe/drafts";
import type { ClothingItem } from "@/lib/types/database";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function fetchActiveItem(
  supabase: Awaited<ReturnType<typeof createRouteClient>>,
  userId: string,
  id: string,
): Promise<ClothingDraftResponse | null> {
  const { data, error } = await supabase
    .from("clothing_items")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data || isDraftItem(data) || data.status === "draft") {
    return null;
  }

  const signedImageUrl = await getSignedWardrobeUrl(data.image_url);
  if (!signedImageUrl) return null;

  return {
    ...(data as ClothingItem),
    signedImageUrl,
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createRouteClient(request);
    const userId = await getRouteUserId(supabase);
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const item = await fetchActiveItem(supabase, userId, id);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Get clothing item error:", error);
    return NextResponse.json({ error: "Failed to load item" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createRouteClient(request);
    const userId = await getRouteUserId(supabase);
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const update = buildClothingPatchUpdate(body);

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const { data: existing } = await supabase
      .from("clothing_items")
      .select("status, notes")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!existing || isDraftItem(existing) || existing.status === "draft") {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("clothing_items")
      .update(update)
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const item = await fetchActiveItem(supabase, userId, id);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Update clothing item error:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 },
    );
  }
}
