import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRouteUserId } from "@/lib/api/route-auth";
import { createRouteClient } from "@/lib/supabase/route-client";
import { buildClothingPatchUpdate } from "@/lib/wardrobe/clothing-patch";
import { isDraftItem } from "@/lib/wardrobe/draft-constants";
import { fetchDraftForUser } from "@/lib/wardrobe/draft-service";
import { pickDraftUpdate } from "@/lib/wardrobe/draft-update";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createRouteClient(request);
    const userId = await getRouteUserId(supabase);
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const draft = await fetchDraftForUser(supabase, userId, id);
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json(draft);
  } catch (error) {
    console.error("Get clothing draft error:", error);
    return NextResponse.json(
      { error: "Failed to load draft" },
      { status: 500 },
    );
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
    const update = pickDraftUpdate(
      buildClothingPatchUpdate(body, { clearAiConfidence: true }),
    );

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

    if (!existing || !isDraftItem(existing)) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("clothing_items")
      .update(update)
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const draft = await fetchDraftForUser(supabase, userId, id);
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json(draft);
  } catch (error) {
    console.error("Update clothing draft error:", error);
    return NextResponse.json(
      { error: "Failed to update draft" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createRouteClient(request);
    const userId = await getRouteUserId(supabase);
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: draft } = await supabase
      .from("clothing_items")
      .select("image_url, status, notes")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!draft || !isDraftItem(draft)) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    await supabase.storage.from("wardrobe-images").remove([draft.image_url]);

    const { error } = await supabase
      .from("clothing_items")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete clothing draft error:", error);
    return NextResponse.json(
      { error: "Failed to delete draft" },
      { status: 500 },
    );
  }
}
