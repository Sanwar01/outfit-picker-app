import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRouteUserId } from "@/lib/api/route-auth";
import { createRouteClient } from "@/lib/supabase/route-client";
import { isDraftItem } from "@/lib/wardrobe/draft-constants";
import { buildDraftConfirmUpdate } from "@/lib/wardrobe/draft-service";
import type { ClothingItem } from "@/lib/types/database";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createRouteClient(request);
    const userId = await getRouteUserId(supabase);
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const { data: confirmed, error } = await supabase
      .from("clothing_items")
      .update(buildDraftConfirmUpdate())
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !confirmed) {
      return NextResponse.json(
        { error: error?.message ?? "Failed to confirm draft" },
        { status: 500 },
      );
    }

    return NextResponse.json(confirmed as ClothingItem);
  } catch (error) {
    console.error("Confirm clothing draft error:", error);
    return NextResponse.json(
      { error: "Failed to confirm draft" },
      { status: 500 },
    );
  }
}
